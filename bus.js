const { BalanceAddedEvent, BalanceReducedEvent } = require('./events');
const { AddBalanceCommand, ReduceBalanceCommand } = require('./command');
const { AddBalanceCommandHandler, ReduceBalanceCommandHandler } = require('./command-handler');
const { UserBalanceProjection } = require('./projection');
const { UserBalance: UserBalanceModel } = require('./db');
const { UserBalanceRepo: UserBalanceESRepo } = require('./repo');
const { es } = require('./es');

class Bus {
  constructor() {
    this.routes = new Map();
  }

  registerHandler(classRef, handler) {
    if (!this.routes.has(classRef.name)) {
      const handlers = []
      this.routes.set(classRef.name, handlers)
    }

    this.routes.get(classRef.name).push(handler)
  }

  send(command) {
    console.log('send command', command)
    const commandClassName = command.constructor.name

    if (this.routes.has(commandClassName)) {
      const commandHandler = this.routes.get(commandClassName)[0];
      commandHandler(command);
    }
  }

  publish(event) {
    const eventClassName = event.constructor.name

    if (!this.routes.has(eventClassName)) return;

    this.routes.get(eventClassName).forEach((eventHandler) => {
      eventHandler(event);
    });
  }
}

const bus = new Bus();

const userBalanceESRepo = new UserBalanceESRepo(es)

 bus.registerHandler(AddBalanceCommand, new AddBalanceCommandHandler(userBalanceESRepo).handle);
 bus.registerHandler(ReduceBalanceCommand, new ReduceBalanceCommandHandler(userBalanceESRepo).handle);
 bus.registerHandler(BalanceAddedEvent, new UserBalanceProjection(UserBalanceModel).handle);
 bus.registerHandler(BalanceReducedEvent, new UserBalanceProjection(UserBalanceModel).handle);

module.exports = bus;
