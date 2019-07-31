const mongoose = require('mongoose');
const { model, Types, Schema } = mongoose;

exports.UserBalanceAggregate = class UserBalanceAggregate {
  constructor(aggregateId, userID = null) {
    this.aggregateId = aggregateId;
    this.userID = userID;
    this.initialBalance = 0;
  }

  /**
   * @param  {object|null} snapshot
   * @param  {object} snapshot.data
   * @param  {string} snap.data.userID
   * @param  {number} snap.data.balance
   */
  loadSnapshot(snapshot) {
    if (!snapshot) {
      console.log('snapshot is null')
      return;
    }
    this.userID = snapshot.data.userID;
    this.initialBalance = snapshot.data.balance;
  }

  loadFromHistory(history) {
    this.history = history;
  }

  getSnap() {
    return {
      userID: this.userID,
      balance: this._getBalance(),
    }
  }

  _getBalance() {
    return this.history.reduce((acc, item) => {
      console.log(item)
      if (item.payload.name === 'BalanceAdded') {
        return acc + item.payload.amount;
      } else if (item.payload.name === 'BalanceReduced') {
        return acc - item.payload.amount;
      }
    }, this.initialBalance)
  }
}

const TransactionSchema = Schema({
  userID: { type: String, required: true },
  type: { type: String,  enum: ['deposit', 'redeem'] },
  amount: Number,
  createdAt: { type: Date, default: Date.now },
});

exports.Transaction = model('Transaction', TransactionSchema);

exports.connect = function connect() {
  mongoose.connect('mongodb://localhost:27017/test_eventstore_db', {
    useNewUrlParser: true
  })
    .then(() => {
      console.log('[mongoose] connected to db');
    });
}

// in memory store implementation
exports.User = class User {
  static findById(userId) {
    const users = [
     { _id: 'user-1', name: 'John Doe' },
     { _id: 'user-2', name: 'Alex Garett' },
    ];

    const foundUser = users.find(user => user._id === userId);

    return Promise.resolve(foundUser);
  }
}
