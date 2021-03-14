export const getInstrumentLink = (type, ticker) => {
    // Добавляет s потому что в урле нужно множественное число
    type = type.toLowerCase() + 's';

    return `https://www.tinkoff.ru/invest/${type}/${ticker}/`;
}
