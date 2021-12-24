import * as Sentry from '@sentry/node'
import { stocksApi } from '../../../helpers/stocksApi'
import { TINKOFF_SENTRY_TAGS } from '../../constants'

const NodeCache = require('node-cache')

const lastPriceCache = new NodeCache({
  stdTTL: 60
})

// TODO: Пропаботать кейс, где ночью или на выхах мы не получим данных
//  Проверять выходной или конец торговой сессии можно запросом за минутной свечей. Если она пустая, то закрыто
//  Либо смотреть на tradingStatus и выключать инератор, если он NotAvailableForTrading
// INFO: В приложении тинька в списке акций показываетс цена закрытия, а когда открываешь тикер - цена последней сделаки
export async function tinkoffGetLastPrice ({ instrumentData }) {
  try {
    let lastPrice = lastPriceCache.get(instrumentData.sourceSpecificData.figi)

    if (!lastPrice) {
      const orderBook = await stocksApi.orderbookGet({
        figi: instrumentData.sourceSpecificData.figi,
        depth: 0
      })

      lastPrice = orderBook.lastPrice

      lastPrice && (lastPriceCache.set(instrumentData.id, lastPrice))
    }

    if (!lastPrice) {
      throw new Error('Отсутствует lastPrice')
    }

    return lastPrice
  } catch (e) {
    Sentry.captureException('Ошибка ответа тиньковской апишски', {
      tags: TINKOFF_SENTRY_TAGS
    })

    throw new Error(e)
  }
}
