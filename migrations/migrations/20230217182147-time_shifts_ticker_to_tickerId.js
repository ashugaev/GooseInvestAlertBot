const logPrefix = "[MIGRATION SHIFTS TICKER ID]"

module.exports = {
    async up(db, client) {
        const shiftCandles = await db.collection('shiftcandles').find().toArray();
        const instrumentsList = await db.collection('instrumentslists').find().toArray();

        // If the ticker count is this high, the collection is most likely populated correctly
        if (instrumentsList.length < 5000 || !shiftCandles.length) {
            throw new Error(`${logPrefix} Failed to load data`)
        }

        const bulkConfig = [];

        shiftCandles.forEach(({ticker, _id}) => {
            let itemsWithMatchedTicker = instrumentsList.filter(item => item.ticker === ticker);

            if (!itemsWithMatchedTicker.length) {
                console.error(logPrefix, 'Migration error for', ticker);
                return;
            }

            // Sort and make items with 'source' === 'binance' first in array and 'bybit' second
            const prioritisedItem = itemsWithMatchedTicker.sort((a, b) => {
                if (a.source === 'binance' && b.source !== 'binance') {
                    return -1; // a should come before b
                } else if (a.source !== 'binance' && b.source === 'binance') {
                    return 1; // a should come after b
                } else if (a.source === 'bybit' && b.source !== 'bybit') {
                    return -1; // a should come before b
                } else if (a.source !== 'bybit' && b.source === 'bybit') {
                    return 1; // a should come after b
                }
                return 0; // a and b are equal in terms of sorting order
            })[0]

            console.log(logPrefix, 'Adding id', prioritisedItem.id, 'for', ticker);

            bulkConfig.push({
                updateMany: {
                    filter: {
                        _id
                    }, update: {
                        $set: {
                            tickerId: prioritisedItem.id,
                            ticker: null,
                        }
                    }
                }
            })
        });

        console.log(logPrefix, 'Collected items in migration config', bulkConfig);

        if (bulkConfig.length) {
            await db.collection('shiftcandles').bulkWrite(bulkConfig)
        }
    },

    async down(db, client) {
        return Promise.resolve('ok')
    }
};
