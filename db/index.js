const mongoose = require('mongoose');

module.exports = function createDB() {
  return {
    connect: function connect() {
      mongoose.connect('mongodb://localhost:27017/test_eventstore_db', {
        useNewUrlParser: true
      })
        .then(() => {
          console.log('[mongoose] connected to db');
        });
    }
  }
}
