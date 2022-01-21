import { prop, getModelForClass } from '@typegoose/typegoose'
import { ICoingecoSpecificBaseData } from '../marketApi/coingecko/types'
import { ITinkoffSpecificBaseData } from '../marketApi/tinkoff/types'
import { EMarketDataSources, EMarketInstrumentTypes, IBaseInstrumentData } from '../marketApi/types'

export class InstrumentsList {
  @prop({ unique: true })
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

  @prop({ required: true })
  sourceSpecificData: ICoingecoSpecificBaseData | ITinkoffSpecificBaseData
}

export const InstrumentsListModel = getModelForClass(InstrumentsList, {
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

export async function putItemsToInstrumentsList (items: IBaseInstrumentData[]) {
  await InstrumentsListModel.insertMany(items)
}

export async function getInstrumentInfoByTicker ({ ticker }: {ticker: string | string[]}): Promise<IBaseInstrumentData[]> {
  try {
    if (!ticker?.length) {
      throw new Error('[getInstrumentInfoByTicker] Не указан необходимый параметр ticker')
    }

    const params = {
      ticker: {
        $in: [].concat(ticker)
      }
    }

    const result: IBaseInstrumentData[] = await InstrumentsListModel.find(params).lean()

    return result
  } catch (e) {
    throw new Error(e)
  }
}

export interface IGetInstrumentsByTypeParams {
  source: EMarketDataSources
}

export async function getInstrumentsBySource ({ source }: IGetInstrumentsByTypeParams) {
  const params = { source }

  const result: IBaseInstrumentData[] = await InstrumentsListModel.find(params)

  return result
}
