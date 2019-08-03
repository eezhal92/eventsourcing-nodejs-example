exports.UserBalanceProjection = class UserBalanceProjection {
  constructor(userBalanceModel) {
    this.userBalanceModel =userBalanceModel;
  }

  handle(event) {
    console.log('event projection', event)
  }
}
