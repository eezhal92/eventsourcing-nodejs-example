const es = require('eventstore');

function createEventStore({ bus }) {
  const eventStore = es({
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

  eventStore.useEventPublisher((e) => {
    console.log('-----');
    console.log('useEventPublisher cb', e.constructor.name ,e);
    console.log('event class name:', e.constructor.name);
    console.log('event', e);
    console.log('-----');
    bus.publish(e);
  });

  return eventStore;
}

module.exports = createEventStore;
