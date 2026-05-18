const logPrefix = '[MIGRATION SHIFTS TICKER ID]'

module.exports = {
    async up(db, client) {
        const shifts = await db.collection('timeshifts').find().toArray();

        const instrumentsList = await db.collection('instrumentslists').find().toArray();

        // If the ticker count is this high, the collection is most likely populated correctly
        if (instrumentsList.length < 5000 || !shifts.length) {
            throw new Error(`${logPrefix} Failed to load data`)
        }

        const bulkConfig = [];

        const uniqShifts = Object.values(shifts.reduce((acc, el) => {
            acc[`${el.name ?? ''}${el.ticker}`] = el;

            return acc;
        }, {}));

        uniqShifts.forEach(({ticker, name}) => {
            const tickerId = instrumentsList.find(item => item.ticker === ticker)?.id;

            if (ticker && tickerId) {
                console.log(logPrefix, 'Adding id', tickerId, 'for', ticker, name);

                bulkConfig.push({
                    updateMany: {
                        filter: {
                            ticker,
                            name,
                            tickerId: undefined
                        },
                        update: {
                            $set: {
                                tickerId,
                            }
                        }
                    }
                })
            } else {
                console.error(logPrefix, 'Migration error for', ticker, tickerId);
            }
        });

        console.log(logPrefix, 'Collected items in migration config', bulkConfig);

        if (bulkConfig.length) {
            await db.collection('timeshifts').bulkWrite(bulkConfig)
        }
    },

    async down(db, client) {
        return Promise.resolve('ok')
    }
};
