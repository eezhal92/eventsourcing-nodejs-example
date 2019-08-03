const { BalanceAddedEvent, BalanceReducedEvent } = require('./events');

exports.AddBalanceCommandHandler = class AddBalanceCommandHandler {
  /**
   * @param  {UserBalanceRepo} userBalanceRepo eventsource repo
   */
  constructor(userBalanceESRepo) {
    // pass deps if needed
    this.userBalanceRepo = userBalanceESRepo;
    this.handle = this.handle.bind(this);
  }

  async handle(command) {
    const userBalance = await this.userBalanceRepo.findById(command.userID);

    userBalance.apply(new BalanceAddedEvent(command.userID, command.amount), true);

    this.userBalanceRepo.save(userBalance);
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
    const userBalance = await this.userBalanceRepo.findById(command.userID);

    userBalance.apply(new BalanceReducedEvent(command.userID, command.amount), true);

    this.userBalanceRepo.save(userBalance);
  }
}
