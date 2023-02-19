// eslint-disable-next-line
import {getModelForClass, prop} from '@typegoose/typegoose'

import { BinanceSourceSpecificData } from '../marketApi/binance/api/getAllInstruments'
import { ICoingecoSpecificBaseData } from '../marketApi/coingecko/types'
import { CurrencyApiSpecificData } from '../marketApi/currencyConverter/getList'
import { ITinkoffSpecificBaseData } from '../marketApi/tinkoff/types'
import { EMarketDataSources } from '../marketApi/types'
import NodeCache from 'node-cache'
import { SymbolInfo } from 'bybit-api'
import { log, retryForever } from '@/helpers'

export enum EMarketInstrumentTypes {
  Stock = 'Stock',
  Crypto = 'Crypto',
  Currency = 'Currency',
  Etf = 'Etf',
  Bond = 'Bond', // Опционы
  Future = 'Future'
}

const instrumentsByIdCache = new NodeCache()
const instrumentsByTickerCache = new NodeCache()
const instrumentsBySourceCache = new NodeCache()

/**
 * Нормализованный элемент бумаги/монеты
 *
 * TODO: Переименовать в Instrument
 *  тут блокер в том, что раньше не работало проставление кастомного названия коллекции
 *  если этого не сделать то коллекция пересоздастся
 */
export class InstrumentsList {
  /**
   * id содержит разные поля в зависимости от source
   * для крипты это id coingecke
   * для бумаг это figi
   */
  @prop({ required: true, unique: true })
  id: string

  /**
   * Тикер не обязательный, потому что это иногда крашит бота
   * Может появиться монета без тикера
   */
  @prop({ required: false, unique: false })
  ticker: string

  @prop({ required: true })
  name: string

  @prop({ required: true })
  source: EMarketDataSources

  @prop({ required: true })
  type: EMarketInstrumentTypes

  @prop({ required: false })
  currency?: string

  @prop({ required: true })
  sourceSpecificData:
  ICoingecoSpecificBaseData |
  ITinkoffSpecificBaseData |
  BinanceSourceSpecificData |
  CurrencyApiSpecificData |
  SymbolInfo // Bybit

  /**
   * Разрядность цены
   * TODO: Убрать 'null' со временем
   */
  @prop({ required: true, default: null })
  priceScale: number | null
}

export const InstrumentsListModel = getModelForClass(InstrumentsList, {
  schemaOptions: { timestamps: true },
  options: {
    customName: 'instrumentslist'
  }
});

/**
 * Auto apdate all data structures for instruments list
 */
// eslint-disable-next-line
(async function autoUpdateInstrumentsListCache () {
  // FIXME: remove limit
  const items = await retryForever(async () => await InstrumentsListModel.find().lean())

  // @ts-expect-error
  const cacheItemsById = items.map((item) => ({
    key: item.id,
    val: item
  }))
  instrumentsByIdCache.mset(cacheItemsById)

  // @ts-expect-error
  const cacheItemsByTicker = items.map((item) => ({
    key: item.ticker,
    val: item
  }))
  instrumentsByTickerCache.mset(cacheItemsByTicker)

  log.info('[autoUpdateInstrumentsListCache] Instruments list cache updated')

  setInterval(autoUpdateInstrumentsListCache, 1000 * 60 * 60 * 3) // Update every 3 hours
})()

// eslint-disable-next-line max-len
export async function getInstrumentInfoByTicker ({ ticker, source }: {ticker: string | string[], source?: string}): Promise<InstrumentsList[]> {
  if (!ticker?.length) {
    throw new Error('[getInstrumentInfoByTicker] Не указан необходимый параметр ticker')
  }

  const params = {
    ticker: {
      $in: [].concat(ticker).map(el => el.toUpperCase())
    }
  }

  if (source) {
    // @ts-expect-error
    params.source = source
  }

  const result: InstrumentsList[] = await InstrumentsListModel.find(params).lean()

  return result
}

export async function getInstrumentListDataByIds (ids: string[]) {
  const params = {
    id: {
      $in: ids
    }
  }

  const result: InstrumentsList[] = await InstrumentsListModel.find(params).lean()

  return result
}

/**
 * Returns list of isntruments by source with cache
 */

export async function getInstrumentsBySourceCache (source: EMarketDataSources): Promise<InstrumentsList[]> {
  const params = { source }

  let allInstrumentsBySource: InstrumentsList[] = instrumentsBySourceCache.get(source)

  if (!allInstrumentsBySource) {
    const result: InstrumentsList[] = await InstrumentsListModel.find(params).lean()

    instrumentsBySourceCache.set(source, result)

    allInstrumentsBySource = result
  }

  if (!allInstrumentsBySource) {
    throw new Error('getInstrumentsBySourceCache: Can\'t update instruments')
  }

  return allInstrumentsBySource
}

export const getInstrumentByIdFromCache = async (id: string): Promise<InstrumentsList> => {
  let res = instrumentsByIdCache.get(id)

  if (!res) {
    res = (await InstrumentsListModel.find({ id }).lean())[0]
  }

  if (!res) {
    throw new Error(`Can't find instrument by id ${id}`)
  }

  return res as InstrumentsList
}
