// eslint-disable-next-line
import {getModelForClass, prop} from '@typegoose/typegoose'

import { BinanceSourceSpecificData } from '../marketApi/binance/api/getAllInstruments'
import { ICoingecoSpecificBaseData } from '../marketApi/coingecko/types'
import { CurrencyApiSpecificData } from '../marketApi/currencyConverter/getList'
import { ITinkoffSpecificBaseData } from '../marketApi/tinkoff/types'
import { EMarketDataSources } from '../marketApi/types'
import NodeCache from 'node-cache'

export enum EMarketInstrumentTypes {
  Stock = 'Stock',
  Crypto = 'Crypto',
  Currency = 'Currency',
  Etf = 'Etf',
  // Опционы
  Bond = 'Bond',
  Future = 'Future'
}

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
  CurrencyApiSpecificData
}

export const InstrumentsListModel = getModelForClass(InstrumentsList, {
  schemaOptions: { timestamps: true },
  options: {
    customName: 'instrumentslist'
  }
})

export async function putItemsToInstrumentsList (items: InstrumentsList[]) {
  await InstrumentsListModel.insertMany(items)
}

export async function getInstrumentInfoByTicker ({ ticker }: {ticker: string | string[]}): Promise<InstrumentsList[]> {
  if (!ticker?.length) {
    throw new Error('[getInstrumentInfoByTicker] Не указан необходимый параметр ticker')
  }

  const params = {
    ticker: {
      $in: [].concat(ticker).map(el => el.toUpperCase())
    }
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
const instrumentsBySourceCache = new NodeCache({
  stdTTL: 3600 // sec
})

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
