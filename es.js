const es = require('eventstore');
const bus = require('./bus');

function create() {
  return es({
    type: 'mongodb',
    host: 'localhost',                          // optional
    port: 27017,                                // optional
    dbName: 'test_eventstore',                  // optional
    eventsCollectionName: 'events',             // optional
    snapshotsCollectionName: 'snapshots',       // optional
    transactionsCollectionName: 'transactions', // optional
    timeout: 10000                              // optional
  // maxSnapshotsCount: 3                        // optional, defaultly will keep all snapshots
  // authSource: 'authedicationDatabase',        // optional
  // username: 'technicalDbUser',                // optional
  // password: 'secret'                          // optional
  // url: 'mongodb://user:pass@host:port/db?opts // optional
  // positionsCollectionName: 'positions' // optioanl, defaultly wont keep position
  });
}

const evtstore = create();
evtstore.useEventPublisher(function(e) {
  console.log('cb event publisher', e.constructor.name ,e);

  bus.publish(e);
});


module.exports = evtstore;
