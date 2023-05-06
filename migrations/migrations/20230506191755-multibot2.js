module.exports = {
  async up(db, client) {
    const matchedShift = await db.collection('timeshifts').find().toArray();

    const bulkConfigShifts = matchedShift.reduce((acc, item) => {
      return acc.concat({
        updateOne: {
          filter: {
            _id: item._id
          },
          update: {
            $set: {
              botId: 1466516028
              // botId: 1478857442
            }
          }
        }
      })
    }, []);

    debugger
    console.log('updating timeshifts')

    if (bulkConfigShifts.length) {
      debugger
      const res = await db.collection('timeshifts').bulkWrite(bulkConfigShifts)
      debugger
    }

    console.log('upated shifts')
  },

  async down(db, client) {
    return Promise.resolve('ok')
  }
};
