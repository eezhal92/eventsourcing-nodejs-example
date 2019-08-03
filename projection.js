const { BalanceAddedEvent, BalanceReducedEvent } = require('./events');

exports.UserBalanceView = class UserBalanceView {
  constructor(UserBalanceModel) {
    this.userBalanceModel = UserBalanceModel;
    // add deps
    this.handle = this.handle.bind(this);
  }

  async handle(event) {
    console.log('event projection handling...', event)
    const userBalance = await this.userBalanceModel.findOne({ user: event.userID });

    if (event instanceof BalanceAddedEvent) {
      console.log('projection added')
      userBalance.balance += event.amount;
    } else if (event instanceof BalanceReducedEvent) {
      console.log('projection reduced')
      userBalance.balance -= event.amount;
    }

    userBalance.save();
  }
}
