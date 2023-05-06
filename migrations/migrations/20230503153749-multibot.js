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

        const matchedAlerts = await db.collection('pricealerts').find().toArray();

        const bulkCofigAlerts = matchedAlerts.reduce((acc, item) => {
            return acc.concat({
                updateOne: {
                    filter: {
                        _id: item._id
                    }, update: {
                        $set: {
                            botId: 1466516028
                            // botId: 1478857442
                        }
                    }
                }
            })
        }, [])

        console.log('updating alerts')

        if (bulkCofigAlerts.length) {
            await db.collection('pricealerts').bulkWrite(bulkCofigAlerts)
        }

        console.log('updated alerts')

        // Users

        const matchedUsers = await db.collection('users').find().toArray();

        const bulkCofigUsers = matchedUsers.reduce((acc, item) => {
            return acc.concat({
                updateOne: {
                    filter: {
                        _id: item._id
                    }, update: {
                        $set: {
                            botId: 1466516028 // prod
                            // botId: 1478857442  // dev
                        }
                    }
                }
            })
        }, [])

        console.log('updating users')

        if (bulkCofigUsers.length) {
            await db.collection('users').bulkWrite(bulkCofigUsers)
        }

        console.log('updated users')
    },

    async down(db, client) {
        return Promise.resolve('ok')
    }
};
