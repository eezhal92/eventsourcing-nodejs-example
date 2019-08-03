const { AddBalanceCommand, ReduceBalanceCommand } = require('./command');
const { AddBalanceCommandHandler, ReduceBalanceCommandHandler } = require('./command-handler');
const { BalanceAddedEvent, BalanceReducedEvent } = require('./events');
const { UserBalanceView } = require('./projection');

module.exports = function createApp ({
  es,
  bus,
  db,
  server,
  userBalanceESRepo,
  UserBalance
}) {
  function initEventStore () {
    return new Promise((resolve) => {
      es.on('connect', () => {
        console.log('[eventstore] storage connected');
      });

      es.init(() => {
        console.log('[eventstore] initialized')
        resolve();
      });
    })
  }

  function registerHandlers() {
    bus.registerHandler(AddBalanceCommand, new AddBalanceCommandHandler(userBalanceESRepo).handle);
    bus.registerHandler(ReduceBalanceCommand, new ReduceBalanceCommandHandler(userBalanceESRepo).handle);
    bus.registerHandler(BalanceAddedEvent, new UserBalanceView(UserBalance).handle);
    bus.registerHandler(BalanceReducedEvent, new UserBalanceView(UserBalance).handle);
  }

  return {
    start: () => {
      Promise.resolve()
       .then(db.connect)
       .then(initEventStore)
       .then(registerHandlers)
       .then(server.start)
    }
  }
}
