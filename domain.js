exports.UserBalanceAggregate = class UserBalanceAggregate {
  constructor(aggregateId, userID = null) {
    this.aggregateId = aggregateId;
    this.userID = userID;
    this.balance = 0;
    this.changes = [];
  }

  getUncommittedChanges() {
    return this.changes;
  }

  markChangesAsCommitted() {
    this.changes = [];
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
    this.balance = snapshot.data.balance;
  }

  /**
   * @param  {Array} history transaction history
   */
  loadFromHistory(history) {
    for (let i = 0; i < history.length; i += 1) {
      const event = history[i];
      this.apply(event);
    }
  }

  apply(event, isNew = false) {
    if (event.name === 'BalanceAdded') {
      this.balance += event.amount;
    } else if (event.name === 'BalanceReduced') {
      this.balance -= event.amount;
    }

    if (isNew) {
      this.changes.push(event);
    }
  }

  getSnap() {
    return {
      userID: this.userID,
      balance: this.balance,
    }
  }
}
