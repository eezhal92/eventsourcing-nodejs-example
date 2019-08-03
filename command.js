exports.AddBalanceCommand = class AddBalanceCommand {
  constructor(userID, amount) {
    this.userID = userID;
    this.amount = amount;
  }
}

exports.ReduceBalanceCommand = class ReduceBalanceCommand {
  constructor(userID, amount) {
    this.userID = userID;
    this.amount = amount;
  }
}
