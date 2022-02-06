const logPrefix = '[MIGRATION]'

module.exports = {
    async up(db, client) {
        const alerts = await db.collection('pricealerts').find().toArray();

        const instrumentsList = await db.collection('instrumentslists').find().toArray();

        // Если тикеров столько то вероятнее всего коллекция заполнена корректно
        if (instrumentsList.length < 5000 || !alerts.length) {
            throw new Error(`${logPrefix} Ошибка получения данных`)
        }

        const bulkConfig = [];

        const alertSymbols = alerts.map(el => el.symbol);

        const alertUniqSymbols = Array.from(new Set(alertSymbols));

        alertUniqSymbols.forEach(symbol => {
            const tickerId = instrumentsList.find(item => item.ticker === symbol)?.id;

            if (symbol && tickerId) {
                console.log('Добавление id', tickerId, 'для', symbol);

                bulkConfig.push({
                    updateMany: {
                        filter: {
                            symbol,
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
                console.error('Ошибка миграции для', symbol, tickerId);
            }
        });

        console.log(logPrefix, 'Собрано элементов в конфиге для миграции', bulkConfig);

        await db.collection('pricealerts').bulkWrite(bulkConfig)
    },

    async down(db, client) {
        return Promise.resolve('ok')
    }
};
