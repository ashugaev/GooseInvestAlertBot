const logPrefix = '[MIGRATION DELETE CURRENCY FROM TICKER]'

module.exports = {
    async up(db, client) {
        const alerts = await db.collection('pricealerts').find({type: 'Crypto'}).toArray();

        const bulkConfig = [];

        const alertSymbols = alerts.map(el => el.symbol);

        const alertUniqSymbols = Array.from(new Set(alertSymbols));

        alertUniqSymbols.forEach(symbol => {
            const [withCurrency, withoutCurrency, currency] = symbol.match(/^(.+)(USD|RUB|EUR)/) || [];

            if (currency && withoutCurrency) {
                console.log(logPrefix, 'Изменяю тикер для', withCurrency, 'на', withoutCurrency);

                bulkConfig.push({
                    updateMany: {
                        filter: {
                            symbol,
                            type: 'Crypto'
                        },
                        update: {
                            $set: {
                                symbol: withoutCurrency,
                            }
                        }
                    }
                })
            } else {
                console.error(logPrefix, 'Ошибка миграции для', symbol);
            }
        });

        console.log(logPrefix, 'Собрано элементов в конфиге для миграции', bulkConfig);

        if (bulkConfig.length) {
            await db.collection('pricealerts').bulkWrite(bulkConfig)
        }
    },

    async down(db, client) {
        return Promise.resolve('ok')
    }
};
