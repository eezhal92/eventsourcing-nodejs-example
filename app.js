module.exports = function createApp ({ es, db, server }) {
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

  return {
    start: () => {
      Promise.resolve()
       .then(db.connect)
       .then(initEventStore)
       .then(server.start)
    }
  }
}
