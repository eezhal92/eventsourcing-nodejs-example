const container = require('./container');

const app = container.resolve('app');

app.start();
