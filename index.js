const express = require('express');
const bodyParser = require('body-parser');
const createEventStore = require('./es');
const {
  connect: connectDB,
  Transaction,
  User,
  UserBalanceAggregate
} = require('./db')
const es = createEventStore();

function initEventStore() {
  return new Promise((resolve) => {
    es.on('connect', () => {
      console.log('[eventstore] storage connected');
    });

    es.init(() => {
      console.log('[eventstore] initialized')
      resolve();
    })
  })
}

function getEventName(type) {
  if (type === 'redeem') {
    return 'BalanceReduced';
  } else if (type === 'deposit') {
    return 'BalanceAdded';
  }

  throw new Error(type + ': type is not supported');
}

const app = express();

app.use(bodyParser.json());

app.get('/users/:id', async (request, response) => {
  const userID = request.params.id;

  const user = await User.findById(userID);

  if (!user) {
    return response.status(404).json({
      message: 'User was not found!',
    });
  }

  es.getFromSnapshot({
    aggregateId: userID,
    aggregate: 'userBalance',
  }, function (error, snapshot, stream) {
    const history = stream.events;
    console.log('[eventstore] current userBalance snapshot:', snapshot);

    const userBalanceAggregate = new UserBalanceAggregate(userID, userID);

    userBalanceAggregate.loadSnapshot(snapshot);
    userBalanceAggregate.loadFromHistory(history);

    const balance = userBalanceAggregate.getSnap().balance;
    const payload = {
      ...user,
      balance,
    }
    return response.json(payload);
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

    es.getFromSnapshot({
      aggregateId: userID,
      aggregate: 'userBalance'
    }, async function (error, snapshot, stream) {
      const history = stream.events;
      const userBalanceAggregate = new UserBalanceAggregate(userID, userID);
      userBalanceAggregate.loadSnapshot(snapshot);
      userBalanceAggregate.loadFromHistory(history);


      if (type === 'redeem' && userBalanceAggregate.getSnap().balance < amount) {
        return response.status(400).json({ message: 'Balance is not enough' });
      }

      stream.addEvent({
        name: getEventName(type),
        amount,
        userID,
      });
      stream.commit();

      await Transaction.create({ userID, type, amount });

      console.log('[eventstore] current userBalance snapshot:', snapshot);

      const HISTORY_LIMIT = 5;
      if (history.length > HISTORY_LIMIT) {
        es.createSnapshot({
          aggregateId: userID,
          aggregate: 'userBalance',          // optional
          data: userBalanceAggregate.getSnap(),
          revision: stream.lastRevision,
          version: 1 // optional
        }, function(err) {
          console.log(new Date() + ' [eventstore]: snapshot created!')
        });
      }

      return response.status(201).json({ message: 'Transaction is created' });
    });
  }
)

function listenHttp() {
  app.listen(3000, () => {
    console.log('[http] listening on 3000')
  })
}

Promise.resolve()
  .then(connectDB)
  .then(initEventStore)
  .then(listenHttp)

