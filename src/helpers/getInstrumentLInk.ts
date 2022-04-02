import { EMarketDataSources, EMarketInstrumentTypes } from '../models';

const getTinkoffInstrumentLink = ({ type, ticker }) => {
  if (!type && !ticker) {
    return;
  }

  // TODO: Убрать эту логику со временем. Для новых алертов это не нужно.
  if (type === EMarketInstrumentTypes.Crypto) {
    return;
  }

  if (type === EMarketInstrumentTypes.Currency) {
    type = 'currencies';
  } else {
    // Добавляет s потому что в урле нужно множественное число
    type = type.toLowerCase() + 's';
  }

  return `https://www.tinkoff.ru/invest/${type}/${ticker}/`;
};

export const getInstrumentLink = ({ type, ticker, source }) => {
  let link;

  // TODO: Выпилить эту проверку через пару месяцев. Он нужен только для того, что бы показывать ссылку для алертов без source
  if (source) {
    if (source === EMarketDataSources.tinkoff) {
      link = getTinkoffInstrumentLink({ ticker, type });
    }

    // TODO: Сделать ссылки для CoinGecko
  } else {
    // TODO Убрать с проверкой на source через пару месяцев
    link = getTinkoffInstrumentLink({ ticker, type });
  }

  return link;
};
