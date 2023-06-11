import { logPrefix } from '@/features/pumpDetect/pumpDetect.constants'
import { log } from '@/helpers'
import { sayToBoss } from '@/helpers/sayToBoss'
import { kucoinCellAll } from '@/marketApi/kucoin/sellAll'
import { tradeWithKucoin } from '@/marketApi/kucoin/trade'

let lastSymbolTrade = null
let lastTickerTrade = null

export const kucoinStartTrade = async (startData, params, chatConfig) => {
  const ticker = startData.toUpperCase()
  const symbol = ticker + '-USDT'

  sayToBoss({ message: `<b>[SIGNAL]</b> Gonna buy ${ticker}` })

  await tradeWithKucoin({
    symbol,
    side: 'buy',
    remark: 'Trigger:' + params.message,
    funds: chatConfig.buyAmount,
  })

  sayToBoss({ message: `<b>[SIGNAL]</b> Order successful ${ticker}` })

  let timeToCancel =
    params.messageSentDate.getTime() + 20000 - new Date().getTime()
  timeToCancel = timeToCancel < 0 ? 0 : timeToCancel

  log.info(logPrefix, 'Time to cancel', timeToCancel)

  const cellRes = await kucoinCellAll({
    delay: timeToCancel,
    symbol,
    retries: 3,
    ticker,
    params,
  })

  lastTickerTrade = ticker
  lastSymbolTrade = symbol

  sayToBoss({
    message: `<b>[SIGNAL]</b> Sold ${cellRes.ticker} ${ticker}. Balance ${cellRes.main} USDT`,
  })
}

export const kucoinFinishTrade = async (params) => {
  if (!lastSymbolTrade || !lastTickerTrade) return

  sayToBoss({ message: `<b>[SIGNAL]</b> Sell` })

  const cellRes = await kucoinCellAll({
    delay: 0,
    symbol: lastSymbolTrade,
    retries: 3,
    ticker: lastTickerTrade,
    params,
  })

  lastTickerTrade = null
  lastSymbolTrade = null

  sayToBoss({
    message: `<b>[SIGNAL]</b> Sold ${cellRes.ticker} ${lastTickerTrade}. Balance ${cellRes.main} USDT`,
  })
}
