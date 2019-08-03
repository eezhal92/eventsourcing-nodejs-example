const mongoose = require('mongoose');
const { model, Schema } = mongoose;

exports.connect = function connect() {
  mongoose.connect('mongodb://localhost:27017/test_eventstore_db', {
    useNewUrlParser: true
  })
    .then(() => {
      console.log('[mongoose] connected to db');
    });
}

const TransactionSchema = Schema({
  userID: { type: String, required: true },
  type: { type: String,  enum: ['deposit', 'redeem'] },
  amount: Number,
  createdAt: { type: Date, default: Date.now },
});

exports.Transaction = model('Transaction', TransactionSchema);

const UserBalanceSchema = Schema({
  user: { type: String, required: true },
  balance: { type: Number, required: true }
});

const UserBalance = model('UserBalance', UserBalanceSchema);

exports.UserBalance = UserBalance;

/**
 * @param {object} payload
 * @param {string} payload.user
 * @param {number} payload.balance
 */
async function createOrUpdateBalance(payload) {
  const userBalance = await UserBalance.findOne({ user: payload.user });

  if (!userBalance) {
    return UserBalance.create(payload);
  }

  userBalance.balance = payload.balance;

  return userBalance.save();
}

exports.createOrUpdateBalance = createOrUpdateBalance;

// in memory store implementation
class User {
  static create(name) {
    const id = Math.random();
    User.users.push({
      _id: id,
      name,
    });

    return UserBalance.create({
      user: id,
      balance: 0,
    });
  }
  static findById(userId) {
    const foundUser = User.users.find(user => user._id === userId);

    return Promise.resolve(foundUser);
  }
}

User.users = [
  { _id: 'user-1', name: 'John Doe' },
  { _id: 'user-2', name: 'Alex Garett' },
];

exports.User = User;
