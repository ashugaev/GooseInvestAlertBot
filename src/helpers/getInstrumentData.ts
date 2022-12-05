import { EMarketDataSources } from '../marketApi/types'
import { InstrumentsList, InstrumentsListModel } from '../models'
import { getLastPrice } from './getLastPrice'
import { log } from './log'

const logPrefix = '[GET INSTRUMENT DATA WITH PRICE]'

interface GetInstrumentDataWithPrice {
  price: number
  instrumentData: InstrumentsList
}

export interface IGetInstrumentDataWithPrice {
  /**
   * Только для случая, когда мы получаем тикер из ввода юзер, во всех остальных кейсах юзать id
   * Только для этого кейса в массиве может быть больше одного элемента
   */
  symbol?: string
  id?: string
}

export async function getInstrumentDataWithPrice ({
  symbol,
  id
}: IGetInstrumentDataWithPrice): Promise<GetInstrumentDataWithPrice[]> {
  try {
    if (!id && !symbol) {
      log.error(logPrefix, 'Ошибка входных данных')
      return []
    }

    let instrumentsList = null

    if (id && !symbol) {
      instrumentsList = await InstrumentsListModel.find({ id }).lean()
    }

    if (symbol && !id) {
      symbol = symbol.toUpperCase()

      instrumentsList = await InstrumentsListModel.find({
        ticker: {
          // Adding USDT for binance
          $in: [symbol, symbol + 'USDT']
        }
      }).lean()
    }

    if (!instrumentsList?.length) {
      log.error(logPrefix, 'Ошибка получения данных для', symbol || id)

      return []
    }

    // Prioritizing binance
    instrumentsList = instrumentsList.sort(el => el.source === EMarketDataSources.binance ? -1 : 1)

    const dataWithPrice = []

    for (let i = 0; i < instrumentsList.length; i++) {
      const instrumentData = instrumentsList[i]
      let lastPrice = null

      try {
        lastPrice = await getLastPrice(instrumentData.id)
      } catch (e) {
        log.error(logPrefix, 'Fetch ERROR', e)
      }

      if (!lastPrice) {
        continue
      }

      dataWithPrice.push({ instrumentData, price: lastPrice })
    }

    return dataWithPrice
  } catch (e) {
    log.error(logPrefix, 'Ошибка получения данных', e)

    return []
  }
}
