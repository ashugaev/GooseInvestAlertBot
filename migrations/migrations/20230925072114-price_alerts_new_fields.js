module.exports = {
    async up(db, client) {
        const matchedAlerts = await db.collection('pricealerts').find({
            triggered: undefined,
            removed: undefined,
            createdAsACopy: undefined
        }).toArray();

        console.log('found alerts ', matchedAlerts.length)

        const bulkCofigAlerts = matchedAlerts.reduce((acc, item) => {
            return acc.concat({
                updateOne: {
                    filter: {
                        _id: item._id
                    }, update: {
                        $set: {
                            triggered: false,
                            removed: false,
                            createdAsACopy: false
                        }
                    }
                }
            })
        }, [])

        console.log('updating alerts ', bulkCofigAlerts.length)

        if (bulkCofigAlerts.length) {
            await db.collection('pricealerts').bulkWrite(bulkCofigAlerts)
        }

        console.log('updated alerts')
        console.log('DONE')
    },

    async down(db, client) {
        return Promise.resolve('ok')
    }
};
