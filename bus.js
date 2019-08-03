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

module.exports = Bus;
