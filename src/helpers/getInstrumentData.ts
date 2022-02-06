import { EMarketDataSources, getInstrumentInfoByTicker, InstrumentsList } from '../models';
import { i18n } from './i18n';
import { log } from './log';
import { getLastPrice } from './stocksApi';

interface GetInstrumentDataWithPrice {
  price: number
  instrumentData: InstrumentsList
}

export interface IGetInstrumentDataWithPrice {
  symbol: string
  ctx?: any
}

export async function getInstrumentDataWithPrice ({
  symbol,
  ctx
}: IGetInstrumentDataWithPrice): Promise<GetInstrumentDataWithPrice[]> {
  symbol = symbol.toUpperCase();

  const ticker = [symbol];
  let customCurrency;

  // TODO: Брать символы из symbols объекта
  const tickerWithCurrency = symbol.match(/^(.+)(usd|eur|rub)$/i);

    // Если тикер содержит в себе валютную пару, то попробуем искать без нее (для крипты)
    // FIXME: Хардкод для валют, что бы не искать крипту вместе с ними.
    //  Уберется, когда случится переезд на получение по id
    if (tickerWithCurrency && (ticker[0] !== 'USDRUB' && ticker[0] !== 'EURRUB')) {
      customCurrency = tickerWithCurrency[2].toUpperCase()
      // Добавить в список для поиска крипту без валютной пары
      ticker.push(tickerWithCurrency[1])
    }

  const instrumentDataArr = await getInstrumentInfoByTicker({ ticker });

  if (!instrumentDataArr.length) {
    if (ctx) {
      await ctx.replyWithHTML(
        i18n.t('ru', 'alertErrorUnexistedSymbol', { symbol }),
        { disable_web_page_preview: true }
      );
    }

      log.info('не пришли данные из базы данных для ', symbol)

    return [];
  }

  const itemsWithPrice = [];

  for (let i = 0; i < instrumentDataArr.length; i++) {
    const instrumentDataItem = instrumentDataArr[i];

    if (instrumentDataItem.source === EMarketDataSources.coingecko) {
      // Подсовываем валюту, если не была указана пара
      // @ts-expect-error
      instrumentDataItem.sourceSpecificData.currency = customCurrency ?? 'USD';
    }

    const lastPrice = await getLastPrice({ instrumentData: instrumentDataItem });

    itemsWithPrice.push({ instrumentData: instrumentDataItem, price: lastPrice });
  }

  return itemsWithPrice;
}
