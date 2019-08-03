exports.AddBalanceCommandHandler = class AddBalanceCommandHandler {
  /**
   * @param  {[type]} userBalanceRepo eventsource repo
   */
  constructor(userBalanceRepo) {
    // pass deps if needed
    this.userBalanceRepo = userBalanceRepo;
    this.handle = this.handle.bind(this);
  }

  async handle(command) {
    console.log('addblaaance', command)
    const userBalance = await this.userBalanceRepo.findById(command.userID);

    userBalance.apply(new BalanceAddedEvent(userID, amount), true);

    this.userBalanceRepo.save(userBalance);

    // update the read model
    // let's say we use projection to do it
    // await createOrUpdateBalance({
    //   user: userBalance.userID,
    //   balance: userBalance.balance,
    // });
  }
}

exports.ReduceBalanceCommandHandler = class ReduceBalanceCommandHandler {
  /**
   * @param  {[type]} userBalanceRepo eventsource repo
   */
  constructor(userBalanceRepo) {
    // pass deps if needed
    this.userBalanceRepo = userBalanceRepo;
    this.handle = this.handle.bind(this);
  }

  async handle(command) {
    console.log('reduceee', command)
    console.log('sdsfsd', this.userBalanceRepo)

    const userBalance = await this.userBalanceRepo.findById(command.userID);
    console.log('hs')
    // userBalance.apply(new BalanceAddedEvent(userID, amount), true);
  }
}
