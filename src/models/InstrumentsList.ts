// eslint-disable-next-line
import { getModelForClass, prop } from '@typegoose/typegoose'

import { BinanceSourceSpecificData } from '../marketApi/binance/api/getAllInstruments'
import { CurrencyApiSpecificData } from '../marketApi/currencyConverter/getList'
import { ITinkoffSpecificBaseData } from '../marketApi/tinkoff/types'
import { EMarketDataSources } from '../marketApi/types'
import { waitForMongoConnection } from '@/db/mongoose'
import NodeCache from 'node-cache'
import { SymbolInfo } from 'bybit-api'
import { log, retryForever } from '@/helpers'
import { KucoinSymbolInfo } from '@/marketApi/kucoin/getInstruments'
import { LbankInstrument } from '@/marketApi/lbank/getInstruments'

export enum EMarketInstrumentTypes {
  Stock = 'Stock',
  Crypto = 'Crypto',
  Currency = 'Currency',
  Etf = 'Etf',
  Bond = 'Bond', // Опционы
  Future = 'Future',
}

const instrumentsByIdCache = new NodeCache({
  stdTTL: 1000 * 60 * 60 * 24,
})
const instrumentsByTickerCache = new NodeCache({
  stdTTL: 1000 * 60 * 60 * 24,
})
const instrumentsBySourceCache = new NodeCache({
  stdTTL: 1000 * 60 * 60 * 24,
})

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
   * для крипты это id биржи
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
    | ITinkoffSpecificBaseData
    | BinanceSourceSpecificData
    | CurrencyApiSpecificData
    | SymbolInfo // Bybit
    | KucoinSymbolInfo
    | LbankInstrument

  /**
   * Разрядность цены (циферок после точки)
   * TODO: Убрать 'null' со временем
   */
  @prop({ required: true, default: null })
  priceScale: number | null
}

// @ts-ignore
export const InstrumentsListModel = getModelForClass(InstrumentsList, {
  schemaOptions: { timestamps: true },
  options: {
    customName: 'instrumentslist',
  },
  // eslint-disable-next-line
})

/**
 * Готовность `instrumentsByIdCache` / `instrumentsByTickerCache`. До первой
 * успешной загрузки `priceChecker` слепой (см. `setupPriceChecker`).
 * Любая логика, читающая кеш через `getInstrumentByIdFromCache(..., noReqToDb=true)`,
 * должна гейтиться этим флагом, иначе на холодном старте 100% алертов фейлятся.
 */
let instrumentsByIdCacheReady = false
export const isInstrumentsByIdCacheReady = (): boolean =>
  instrumentsByIdCacheReady

interface BulkSetCache {
  mset: (data: { key: string; val: unknown }[]) => boolean
}

/**
 * Чистая функция: раскладывает items по двум кешам. Вынесено для unit-тестов.
 */
export const populateInstrumentsCaches = (
  items: Pick<InstrumentsList, 'id' | 'ticker'>[],
  byIdCache: BulkSetCache,
  byTickerCache: BulkSetCache
): void => {
  const cacheItemsById = items
    .filter((item) => typeof item.id === 'string' && item.id.length > 0)
    .map((item) => ({ key: item.id, val: item }))
  byIdCache.mset(cacheItemsById)

  const objByTicker = items.reduce<Record<string, unknown[]>>((acc, item) => {
    if (!item.ticker) return acc
    if (acc[item.ticker]) {
      acc[item.ticker].push(item)
    } else {
      acc[item.ticker] = [item]
    }
    return acc
  }, {})

  const cacheByTicker = Object.entries(objByTicker).map(([key, val]) => ({
    key,
    val,
  }))
  byTickerCache.mset(cacheByTicker)
}

/**
 * Auto update all data structures for instruments list
 */
const REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 3 // 3 hours
const FAILED_RETRY_MS = 60 * 1000 // 1 min after crash, чтобы priceChecker не висел 3h
// eslint-disable-next-line
;(async function autoUpdateInstrumentsListCache() {
  let nextDelayMs = REFRESH_INTERVAL_MS
  try {
    const items: InstrumentsList[] = await retryForever(async () => {
      await waitForMongoConnection('autoUpdateInstrumentsListCache')

      return await InstrumentsListModel.find().lean()
    })

    populateInstrumentsCaches(
      items,
      instrumentsByIdCache,
      instrumentsByTickerCache
    )
    instrumentsByIdCacheReady = true

    log.info('[autoUpdateInstrumentsListCache] Instruments list cache updated')
  } catch (e) {
    // Раньше падение между find() и log.info уходило в unhandledRejection и
    // оставляло кеш пустым навсегда. Логируем и идём на быстрый ретрай —
    // если кеш ещё не загружался ни разу, priceChecker висит на гейте,
    // и ждать 3 часа значит держать алерты в простое всё это время.
    nextDelayMs = FAILED_RETRY_MS
    log.error('[autoUpdateInstrumentsListCache] Cache load crashed', e)
  } finally {
    setTimeout(autoUpdateInstrumentsListCache, nextDelayMs)
  }
})()

// eslint-disable-next-line max-len
export async function getInstrumentInfoByTicker({
  ticker,
  source,
}: {
  ticker: string | string[]
  source?: string
}): Promise<InstrumentsList[]> {
  if (!ticker?.length) {
    throw new Error(
      '[getInstrumentInfoByTicker] Не указан необходимый параметр ticker'
    )
  }

  const params = {
    ticker: {
      $in: [].concat(ticker).map((el) => el.toUpperCase()),
    },
  }

  if (source) {
    // @ts-expect-error
    params.source = source
  }

  await waitForMongoConnection('getInstrumentInfoByTicker')

  const result: InstrumentsList[] = await InstrumentsListModel.find(
    params
  ).lean()

  return result
}

export async function getInstrumentListDataByIds(ids: string[]) {
  const params = {
    id: {
      $in: ids,
    },
  }

  await waitForMongoConnection('getInstrumentListDataByIds')

  const result: InstrumentsList[] = await InstrumentsListModel.find(
    params
  ).lean()

  return result
}

/**
 * Returns list of isntruments by source with cache
 */

export async function getInstrumentsBySourceCache(
  source: EMarketDataSources
): Promise<InstrumentsList[]> {
  const params = { source }

  let allInstrumentsBySource: InstrumentsList[] =
    instrumentsBySourceCache.get(source)

  if (!allInstrumentsBySource) {
    await waitForMongoConnection('getInstrumentsBySourceCache')

    const result: InstrumentsList[] = await InstrumentsListModel.find(
      params
    ).lean()

    instrumentsBySourceCache.set(source, result)

    allInstrumentsBySource = result
  }

  if (!allInstrumentsBySource) {
    throw new Error("getInstrumentsBySourceCache: Can't update instruments")
  }

  return allInstrumentsBySource
}

export const getInstrumentByIdFromCache = async (
  id: string,
  noReqToDb?: boolean,
  noThrow?: boolean
): Promise<InstrumentsList> => {
  let res = instrumentsByIdCache.get(id)

  if (!res && !noReqToDb) {
    await waitForMongoConnection('getInstrumentByIdFromCache')

    res = (await InstrumentsListModel.find({ id }).lean())[0]
  }

  if (!res && !noThrow) {
    throw new Error(`Can't find instrument by id ${id}`)
  }

  return res as InstrumentsList
}

export const getInstrumentByTickerFromCache = async (
  ticker?: string,
  noReqToDb?: boolean
): Promise<InstrumentsList[]> => {
  let res: InstrumentsList[] = instrumentsByTickerCache.get(
    ticker
  ) as InstrumentsList[]

  if (!res?.length && !noReqToDb) {
    await waitForMongoConnection('getInstrumentByTickerFromCache')

    res = await InstrumentsListModel.find({ ticker }).lean()
  }

  if (!res) {
    throw new Error(`Can't find instrument by ticker ${ticker}`)
  }

  return res
}

export const getOneInstrumentFromCache = async ({
  ticker,
  source,
}: {
  ticker: string
  source: EMarketDataSources
}): Promise<InstrumentsList> => {
  const instruments = await getInstrumentByTickerFromCache(ticker)

  const instrument = instruments.find((el) => el.source === source)

  if (!instrument) {
    throw new Error(
      `Can't find instrument by ticker ${ticker} and source ${source}`
    )
  }

  return instrument
}
