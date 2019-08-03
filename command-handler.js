exports.AddBalanceCommandHandler = class AddBalanceCommandHandler {
  /**
   * @param  {[type]} userBalanceRepo eventsource repo
   */
  constructor(userBalanceRepo) {
    // pass deps if needed
  }

  async handle(command) {
    console.log('addblaaance', command)
  }
}

exports.ReduceBalanceCommandHandler = class ReduceBalanceCommandHandler {
  /**
   * @param  {[type]} userBalanceRepo eventsource repo
   */
  constructor(userBalanceRepo) {
    // pass deps if needed
  }

  handle(command) {
    console.log('reduceee', command)
  }
}
