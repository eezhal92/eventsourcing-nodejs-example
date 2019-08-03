const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const {
  connect: connectDB,
  User,
  UserBalance: UserBalanceReadModel,
  createOrUpdateBalance,
} = require('./db');
const { BalanceAddedEvent, BalanceReducedEvent } = require('./events')
const { AddBalanceCommand, ReduceBalanceCommand } = require('./command')

const { userBalanceRepo: userBalanceESRepo } = require('./repo');
const bus = require('./bus')

const { initEventStore } = require('./es');

function createTransactionEvent({
  type,
  userID,
  amount
}) {
  if (type === 'redeem') {
    return new BalanceReducedEvent(userID, amount);
  } else if (type === 'deposit') {
    return new BalanceAddedEvent(userID, amount);
  }

  throw new Error(type + ': type is not supported');
}

function createTransactionCommand({ type, userID, amount }) {
  if (type === 'redeem') {
    return new ReduceBalanceCommand(userID, amount);
  } else if (type === 'deposit') {
    return new AddBalanceCommand(userID, amount);
  }
}

const app = express();

app.use(morgan())
app.use(bodyParser.json());

app.get('/users/:id', async (request, response) => {
  const userID = request.params.id;

  const user = await User.findById(userID);

  if (!user) {
    return response.status(404).json({
      message: 'User was not found!',
    });
  }

  Promise.all([
    userBalanceESRepo.findById(userID),
    UserBalanceReadModel.findOne({ user: userID })
  ]).then(([aggregate, readModel]) => {
      return response.json({
        aggregate,
        readModel
      });
    })
})

app.post(
  '/transactions',
  (request, response, next) => {
    const { body } = request;
    const errors = [];
    if (!body.userID) errors.push({ userId: 'required' });
    if (!body.type) errors.push({ type: 'required' });
    if (body.type && !['deposit', 'redeem'].includes(body.type)) errors.push({ type: 'should be `deposit` or `redeem`'})
    if (!body.amount) errors.push({ amount: 'required' });

    if (errors.length) return response.status(422).json({ errors });

    next();
  },
  async (request, response) => {
    const { userID, type, amount } = request.body;
    const user = await User.findById(userID);

    if (!user) {
      return response.status(404).json({
        message: 'User was not found!',
      });
    }

    const userBalance = await userBalanceESRepo.findById(userID);
    const command = createTransactionCommand({
      type,
      userID,
      amount,
    });

    if (type === 'redeem' && userBalance.balance < amount) {
      return response.status(400).json({ message: 'Balance is not enough' });
    }

    bus.send(command);

    return response.status(201).json({ message: 'Transaction is created' });
  }
)

function listenHttp() {
  app.listen(3000, () => {
    console.log('[http] listening on 3000')
  })
}

// Setup and run the app
Promise.resolve()
  .then(connectDB)
  .then(initEventStore)
  .then(listenHttp)

