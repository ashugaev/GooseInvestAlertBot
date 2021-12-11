import { getModelForClass, prop } from '@typegoose/typegoose'

import { ICoingecoSpecificBaseData } from '../marketApi/coingecko/types'
import { ITinkoffSpecificBaseData } from '../marketApi/tinkoff/types'

export enum EMarketDataSources {
  tinkoff = 'tinkoff',
  coingecko = 'coingecko'
}

export enum EMarketInstrumentTypes {
  Stock = 'Stock',
  Crypto = 'Crypto'
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

  @prop({ required: true, unique: false })
  ticker: string

  @prop({ required: true })
  name: string

  @prop({ required: true })
  source: EMarketDataSources

  @prop({ required: true })
  type: EMarketInstrumentTypes

  @prop({ required: true })
  currency: string

  @prop({ required: true })
  sourceSpecificData: ICoingecoSpecificBaseData | ITinkoffSpecificBaseData
}

const InstrumentsListModel = getModelForClass(InstrumentsList, {
  schemaOptions: { timestamps: true },
  options: {
    customName: 'instrumentslist'
  }
})

export async function clearInstrumentsList () {
  try {
    await InstrumentsListModel.deleteMany({})
  } catch (e) {
    throw new Error(e)
  }
}

export async function putItemsToInstrumentsList (items: InstrumentsList[]) {
  try {
    await InstrumentsListModel.insertMany(items)
  } catch (e) {
    throw new Error(e)
  }
}

export async function getInstrumentInfoByTicker ({ ticker }: {ticker: string | string[]}): Promise<InstrumentsList[]> {
  try {
    if (!ticker?.length) {
      throw new Error('[getInstrumentInfoByTicker] Не указан необходимый параметр ticker')
    }

    const params = {
      ticker: {
        $in: [].concat(ticker)
      }
    }

    const result: InstrumentsList[] = await InstrumentsListModel.find(params).lean()

    return result
  } catch (e) {
    throw new Error(e)
  }
}

export async function getInstrumentDataById (id) {
  const result = await InstrumentsListModel.find({ id }).lean()

  return result[0]
}

export interface IGetInstrumentsByTypeParams {
  source: EMarketDataSources
}

export async function getInstrumentsBySource ({ source }: IGetInstrumentsByTypeParams) {
  const params = { source }

  const result: InstrumentsList[] = await InstrumentsListModel.find(params)

  return result
}
