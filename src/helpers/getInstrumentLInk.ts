import { BinanceSourceSpecificData } from '@/marketApi/binance/api/getAllInstruments'

import { EMarketDataSources } from '../marketApi/types'
import { EMarketInstrumentTypes, InstrumentsList } from '../models'

export const getTinkoffInstrumentLink = ({
  type,
  ticker,
}: Partial<InstrumentsList>) => {
  let typeForLink: EMarketInstrumentTypes | string = type

  if (!type && !ticker) {
    return
  }

  // TODO: Убрать эту логику со временем. Для новых алертов это не нужно.
  if (type === EMarketInstrumentTypes.Crypto) {
    return
  }

  if (type === EMarketInstrumentTypes.Currency) {
    typeForLink = 'currencies'
  } else {
    // Добавляет s потому что в урле нужно множественное число
    typeForLink = type.toLowerCase() + 's'
  }

  return `https://www.tinkoff.ru/invest/${typeForLink}/${ticker}/`
}

export const getInstrumentLink = ({
  type,
  ticker,
  source,
  sourceSpecificData,
  currency,
}: Partial<InstrumentsList>): string | undefined => {
  let link

  if (source === EMarketDataSources.tinkoff && ticker && type) {
    link = getTinkoffInstrumentLink({ ticker, type })
  }

  if (source === EMarketDataSources.binance && sourceSpecificData && ticker) {
    const base = (sourceSpecificData as BinanceSourceSpecificData).baseAsset
    const sec = ticker.replace(base, '')
    if (base?.length && sec?.length) {
      link = `https://www.binance.com/en/trade/${base}_${sec}`
    }
  }

  if (source === EMarketDataSources.bybit && currency && ticker) {
    link = `https://www.bybit.com/trade/${currency.toLowerCase()}/${ticker.toUpperCase()}`
  }

  if (source === EMarketDataSources.kucoin && sourceSpecificData) {
    if ('symbol' in sourceSpecificData) {
      link = `https://www.kucoin.com/trade/${sourceSpecificData.symbol}`
    }
  }

  if (source === EMarketDataSources.lbank && sourceSpecificData) {
    if ('symbol' in sourceSpecificData) {
      link = `https://www.lbank.com/trade/${sourceSpecificData.symbol}`
    }
  }

  return link
}
