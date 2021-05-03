import { prop, getModelForClass } from '@typegoose/typegoose'
import { ICoingecoSpecificBaseData } from "../marketApi/coingecko/types";
import { ITinkoffSpecificBaseData } from "../marketApi/tinkoff/types";
import { EMarketDataSources, EMarketInstrumentTypes, IBaseInstrumentData } from "../marketApi/types";

export class InstrumentsList {
    @prop({ required: true, unique: true })
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

const InstrumentsListModel = getModelForClass(InstrumentsList, {
    schemaOptions: { timestamps: true },
    options: {
        customName: 'instrumentslist'
    }
})

export async function clearInstrumentsList() {
    try {
        await InstrumentsListModel.deleteMany({});
    } catch (e) {
        throw new Error(e);
    }
}

export async function putItemsToInstrumentsList(items: IBaseInstrumentData[]) {
    try {
        await InstrumentsListModel.insertMany(items)
    } catch (e) {
        throw new Error(e);
    }
}

export async function getInstrumentInfoByTicker({ticker}: {ticker: string | string[]}): Promise<IBaseInstrumentData[]> {
        try {
            if(!ticker?.length) {
                throw new Error('[getInstrumentInfoByTicker] Не указан необходимый параметр ticker')
            }

            const params = {
                ticker: {
                    $in: [].concat(ticker)
                }
            };

            const result: IBaseInstrumentData[] = await InstrumentsListModel.find(params)

            return result;
        } catch (e) {
            throw new Error(e);
        }
}
