const logPrefix = '[MIGRATION ADD TICKER ID TO PRICE ALERT]'

module.exports = {
    async up(db, client) {
        const alerts = await db.collection('pricealerts').find().toArray();

        const instrumentsList = await db.collection('instrumentslists').find().toArray();

        // Если тикеров столько то вероятнее всего коллекция заполнена корректно
        if (instrumentsList.length < 5000 || !alerts.length) {
            throw new Error(`${logPrefix} Ошибка получения данных`)
        }

        const bulkConfig = [];

        const alertSymbols = Object.values(alerts.reduce((acc, el) => {
            acc[`${el.name ?? ''}${el.symbol}`] = el;

            return acc;
        }, {}));

        alertSymbols.forEach(({symbol, name}) => {
            const tickerId = instrumentsList.find(item => item.ticker === symbol)?.id;

            if (symbol && tickerId) {
                console.log('Добавление id', tickerId, 'для', symbol, name);

                bulkConfig.push({
                    updateMany: {
                        filter: {
                            symbol,
                            // Имя для подстраховки, что бы не заполнить не тот тикер
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
