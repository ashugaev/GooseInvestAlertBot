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
                console.log(logPrefix, 'Updating ticker for', withCurrency, 'to', withoutCurrency);

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
                console.error(logPrefix, 'Migration error for', symbol);
            }
        });

        console.log(logPrefix, 'Collected items in migration config', bulkConfig);

        if (bulkConfig.length) {
            await db.collection('pricealerts').bulkWrite(bulkConfig)
        }
    },

    async down(db, client) {
        return Promise.resolve('ok')
    }
};
