import { BinanceSourceSpecificData } from '@/marketApi/binance/api/getAllInstruments'

import { EMarketDataSources } from '../marketApi/types'
import { EMarketInstrumentTypes, InstrumentsList } from '../models'

export const getTinkoffInstrumentLink = ({ type, ticker }: Partial<InstrumentsList>) => {
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

export const getInstrumentLink = ({
  type,
  ticker,
  source,
  sourceSpecificData,
  currency
}: Partial<InstrumentsList>): string | undefined => {
  let link

  if (source === EMarketDataSources.tinkoff && (ticker && type)) {
    link = getTinkoffInstrumentLink({ ticker, type })
  }

  if (source === EMarketDataSources.binance && (sourceSpecificData && ticker)) {
    const base = (sourceSpecificData as BinanceSourceSpecificData).baseAsset
    const sec = ticker.replace(base, '')
    if (base?.length && sec?.length) {
      link = `https://www.binance.com/en/trade/${base}_${sec}`
    }
  }

  if (source === EMarketDataSources.bybit && (currency && ticker)) {
    link = `https://www.bybit.com/trade/${currency.toLowerCase()}/${ticker.toUpperCase()}`
  }

  return link
}
