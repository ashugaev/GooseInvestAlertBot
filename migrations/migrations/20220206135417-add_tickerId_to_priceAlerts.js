const logPrefix = '[MIGRATION ADD TICKER ID TO PRICE ALERT]'

module.exports = {
    async up(db, client) {
        const alerts = await db.collection('pricealerts').find().toArray();

        const instrumentsList = await db.collection('instrumentslists').find().toArray();

        // If the ticker count is this high, the collection is most likely populated correctly
        if (instrumentsList.length < 5000 || !alerts.length) {
            throw new Error(`${logPrefix} Failed to load data`)
        }

        const bulkConfig = [];

        const alertSymbols = Object.values(alerts.reduce((acc, el) => {
            acc[`${el.name ?? ''}${el.symbol}`] = el;

            return acc;
        }, {}));

        alertSymbols.forEach(({symbol, name}) => {
            const tickerId = instrumentsList.find(item => item.ticker === symbol)?.id;

            if (symbol && tickerId) {
                console.log('Adding id', tickerId, 'for', symbol, name);

                bulkConfig.push({
                    updateMany: {
                        filter: {
                            symbol,
                            // Name as a safeguard, to avoid filling in the wrong ticker
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
                console.error('Migration error for', symbol, tickerId);
            }
        });

        console.log(logPrefix, 'Collected items in migration config', bulkConfig);

        await db.collection('pricealerts').bulkWrite(bulkConfig)
    },

    async down(db, client) {
        return Promise.resolve('ok')
    }
};
