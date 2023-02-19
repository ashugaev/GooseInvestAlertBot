const logPrefix = "[MIGRATION SHIFTS TICKER ID]"

module.exports = {
    async up(db, client) {
        const shiftCandles = await db.collection('shiftcandles').find().toArray();
        const instrumentsList = await db.collection('instrumentslists').find().toArray();

        // Если тикеров столько то вероятнее всего коллекция заполнена корректно
        if (instrumentsList.length < 5000 || !shiftCandles.length) {
            throw new Error(`${logPrefix} Ошибка получения данных`)
        }

        const bulkConfig = [];

        shiftCandles.forEach(({ticker, _id}) => {
            let itemsWithMatchedTicker = instrumentsList.filter(item => item.ticker === ticker);

            if (!itemsWithMatchedTicker.length) {
                console.error(logPrefix, 'Ошибка миграции для', ticker);
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

            console.log(logPrefix, 'Добавление id', prioritisedItem.id, 'для', ticker);

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

        console.log(logPrefix, 'Собрано элементов в конфиге для миграции', bulkConfig);

        if (bulkConfig.length) {
            await db.collection('shiftcandles').bulkWrite(bulkConfig)
        }
    },

    async down(db, client) {
        return Promise.resolve('ok')
    }
};
