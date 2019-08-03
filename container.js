const awilix = require('awilix');

const app = require('./app');
const db = require('./db');
const server = require('./http/server');
const es = require('./es');
const Bus = require('./bus');
const { UserBalanceRepo } = require('./repo'); // for writing
const { UserBalance } = require('./db/models'); // for reading

const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY
});

container.register({
  app: awilix.asFunction(app).singleton(),
  db: awilix.asFunction(db).singleton(),
  server: awilix.asFunction(server).singleton(),
  es: awilix.asFunction(es).singleton(),
  bus: awilix.asClass(Bus).singleton(),

  userBalanceESRepo: awilix.asClass(UserBalanceRepo).singleton(),
  UserBalance: awilix.asValue(UserBalance)
});

module.exports = container;
