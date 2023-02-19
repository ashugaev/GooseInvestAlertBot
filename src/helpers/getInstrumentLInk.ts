import { BinanceSourceSpecificData } from '@/marketApi/binance/api/getAllInstruments'

import { EMarketDataSources } from '../marketApi/types'
import { EMarketInstrumentTypes, InstrumentsList } from '../models'

export const getTinkoffInstrumentLink = ({ type, ticker }) => {
  if (!type && !ticker) {
    return
  }

  // TODO: Убрать эту логику со временем. Для новых алертов это не нужно.
  if (type === EMarketInstrumentTypes.Crypto) {
    return
  }

  if (type === EMarketInstrumentTypes.Currency) {
    type = 'currencies'
  } else {
    // Добавляет s потому что в урле нужно множественное число
    type = type.toLowerCase() + 's'
  }

  return `https://www.tinkoff.ru/invest/${type}/${ticker}/`
}

export const getInstrumentLink = ({ type, ticker, source }: any, instrumentInfo?: InstrumentsList): string | undefined => {
  let link

  if (source === EMarketDataSources.tinkoff) {
    link = getTinkoffInstrumentLink({ ticker, type })
  }

  if (source === EMarketDataSources.binance && instrumentInfo) {
    const base = (instrumentInfo.sourceSpecificData as BinanceSourceSpecificData).baseAsset
    const sec = instrumentInfo.ticker.replace(base, '')
    if (base?.length && sec?.length) {
      link = `https://www.binance.com/en/trade/${base}_${sec}`
    }
  }

  return link
}
