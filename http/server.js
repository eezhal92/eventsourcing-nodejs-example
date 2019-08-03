 const express = require('express');
 const bodyParser = require('body-parser');
 const morgan = require('morgan');
 const { User } = require('../db/models');
 const { AddBalanceCommand, ReduceBalanceCommand } = require('../command')

function createTransactionCommand({ type, userID, amount }) {
  if (type === 'redeem') {
    return new ReduceBalanceCommand(userID, amount);
  } else if (type === 'deposit') {
    return new AddBalanceCommand(userID, amount);
  }
}

function createServer ({ bus, UserBalance, userBalanceESRepo }) {
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
     UserBalance.findOne({ user: userID })
    ]).then(([fromWrite, fromRead]) => {
       return response.json({
         fromWrite,
         fromRead
       });
     })
  });

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

  return {
    app,
    start: function start() {
      app.listen(3000, () => {
        console.log('[http] Listening on port: 3000');
      });
    }
  };
}

module.exports = createServer;
