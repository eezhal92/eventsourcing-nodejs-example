const BALANCE_ADDED = 'BalanceAdded';
const BALANCE_REDUCED = 'BalanceReduced';

exports.BALANCE_ADDED = BALANCE_ADDED;
exports.BALANCE_REDUCED = BALANCE_REDUCED;

class DomainEvent {}

class BalanceAddedEvent extends DomainEvent {
  constructor(userID, amount) {
    super();
    this.name = BALANCE_ADDED;
    this.amount = amount;
    this.userID = userID;
  }
}

class BalanceReducedEvent extends DomainEvent {
  constructor(userID, amount) {
    super();
    this.name = BALANCE_REDUCED;
    this.amount = amount;
    this.userID = userID;
  }
}

exports.DomainEvent = DomainEvent;
exports.BalanceAddedEvent = BalanceAddedEvent;
exports.BalanceReducedEvent = BalanceReducedEvent;
