import {EMarketDataSources, getInstrumentInfoByTicker, InstrumentsList} from '../models'
import { i18n } from './i18n'
import { log } from './log'
import { getLastPrice } from './stocksApi'

interface GetInstrumentDataWithPrice {
  price: number
  instrumentData: InstrumentsList
}

interface IGetInstrumentDataWithPrice {
  symbol: string
  ctx?: any
}

export async function getInstrumentDataWithPrice ({
  symbol,
  ctx
}: IGetInstrumentDataWithPrice): Promise<GetInstrumentDataWithPrice[]> {
  symbol = symbol.toUpperCase()

  try {
    const ticker = [symbol]
    let customCurrency

    // TODO: Брать символы из symbols объекта
    const tickerWithCurrency = symbol.match(/^(.+)(usd|eur|rub)$/i)

    // Если тикер содержит в себе валютную пару, то попробуем искать без нее (для крипты)
    if (tickerWithCurrency) {
      customCurrency = tickerWithCurrency[2].toUpperCase()
      // Добавить в список для поиска крипту без валютной пары
      ticker.push(tickerWithCurrency[1])
    }

    const instrumentDataArr = await getInstrumentInfoByTicker({ ticker })

    if (!instrumentDataArr.length) {
      if (ctx) {
        await ctx.replyWithHTML(
          i18n.t('ru', 'alertErrorUnexistedSymbol', { symbol }),
          { disable_web_page_preview: true }
        )
      }

      log.info('не пришли данные из апишки', instrumentDataArr)

      return []
    }

    const itemsWithPrice = []

    for (let i = 0; i < instrumentDataArr.length; i++) {
      const instrumentDataItem = instrumentDataArr[i]

      if (instrumentDataItem.source === EMarketDataSources.coingecko) {
        // Подсовываем валюту, если не была указана пара
        // @ts-expect-error
        instrumentDataItem.sourceSpecificData.currency = customCurrency ?? 'USD'
      }

      const lastPrice = await getLastPrice({ instrumentData: instrumentDataItem })

      itemsWithPrice.push({ instrumentData: instrumentDataItem, price: lastPrice })
    }

    return itemsWithPrice
  } catch (e) {
    throw new Error(e)
  }
}
