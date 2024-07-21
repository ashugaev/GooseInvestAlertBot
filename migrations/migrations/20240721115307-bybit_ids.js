module.exports = {
  async up(db, client) {
    const matchedAlerts = await db.collection('pricealerts').find({
      source: 'bybit',
    }).toArray()

    console.log('found alerts ', matchedAlerts.length)

    const bulkCofigAlerts = matchedAlerts
      .filter(el => el.tickerId.startsWith('bybit_'))
      .reduce((acc, item) => {
        return acc.concat({
          updateOne: {
            filter: {
              _id: item._id,
            }, update: {
              $set: {
                tickerId: item.tickerId.replace(/1+0+(?=[A-Z])/g, ''),
              },
            },
          },
        })
      }, [])

    console.log('updating alerts ', bulkCofigAlerts.length)

    if (bulkCofigAlerts.length) {
      await db.collection('pricealerts').bulkWrite(bulkCofigAlerts)
    }

    console.log('updated alerts')
    console.log('DONE price alerts')
  },

  async down(db, client) {
    return Promise.resolve('ok')
  },
}
