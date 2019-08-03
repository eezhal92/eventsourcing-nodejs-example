const awilix = require('awilix');

const app = require('./app');
const db = require('./db');
const server = require('./http/server');
const es = require('./es');
const Bus = require('./bus');
const { UserBalanceRepo } = require('./repo');

const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY
});

container.register({
  app: awilix.asFunction(app),
  db: awilix.asFunction(db),
  server: awilix.asFunction(server),
  es: awilix.asFunction(es),
  bus: awilix.asClass(Bus),

  userBalanceESRepo: awilix.asClass(UserBalanceRepo).singleton(),
});

module.exports = container;
