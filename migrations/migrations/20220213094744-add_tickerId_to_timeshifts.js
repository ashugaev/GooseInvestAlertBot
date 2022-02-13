const logPrefix = '[MIGRATION SHIFTS TICKER ID]'

module.exports = {
    async up(db, client) {
        const shifts = await db.collection('timeshifts').find().toArray();

        const instrumentsList = await db.collection('instrumentslists').find().toArray();

        // Если тикеров столько то вероятнее всего коллекция заполнена корректно
        if (instrumentsList.length < 5000 || !shifts.length) {
            throw new Error(`${logPrefix} Ошибка получения данных`)
        }

        const bulkConfig = [];

        const uniqShifts = Object.values(shifts.reduce((acc, el) => {
            acc[`${el.name ?? ''}${el.ticker}`] = el;

            return acc;
        }, {}));

        uniqShifts.forEach(({ticker, name}) => {
            const tickerId = instrumentsList.find(item => item.ticker === ticker)?.id;

            if (ticker && tickerId) {
                console.log(logPrefix, 'Добавление id', tickerId, 'для', ticker, name);

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
                console.error(logPrefix, 'Ошибка миграции для', ticker, tickerId);
            }
        });

        console.log(logPrefix, 'Собрано элементов в конфиге для миграции', bulkConfig);

        if (bulkConfig.length) {
            await db.collection('timeshifts').bulkWrite(bulkConfig)
        }
    },

    async down(db, client) {
        return Promise.resolve('ok')
    }
};
