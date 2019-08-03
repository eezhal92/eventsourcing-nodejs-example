const { UserBalanceAggregate } = require('./domain');

class UserBalanceRepo {
  constructor({ es }) {
    this.es = es;
  }

  findById (id) {
    return new Promise((resolve, reject) => {
      this.es.getFromSnapshot({
        aggregateId: id,
        aggregate: 'userBalance',
      }, function (error, snapshot, stream) {
        if (error) return reject(error);

        const history = stream.events;
        const userBalance = new UserBalanceAggregate(id, id);

        userBalance.loadSnapshot(snapshot);
        userBalance.loadFromHistory(history.map(history => history.payload));

        return resolve(userBalance);
      })
    });
  }

  save (userBalance) {
    return new Promise((resolve, reject) => {
      this.es.getFromSnapshot({
        aggregateId: userBalance.userID,
        aggregate: 'userBalance'
      }, async function (error, snapshot, stream) {
        if (error) return reject(error);

        const uncommitedChanges = userBalance.getUncommittedChanges();

        for (let i = 0; i < uncommitedChanges.length; i += 1) {
          const event = uncommitedChanges[i];
          console.log('add event')
          stream.addEvent(event);
        }
        console.log('going to commit')
        stream.commit();
        userBalance.markChangesAsCommitted();

        resolve();
      })
    })
  }
}

exports.UserBalanceRepo = UserBalanceRepo;
