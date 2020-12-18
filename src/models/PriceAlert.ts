// Dependencies
import {prop, getModelForClass} from '@typegoose/typegoose'
import {log} from "../helpers/log";

export interface AddPriceAlertParams {
    user: number,
    symbol: string,
    lowerThen?: number,
    greaterThen?: number,
}

export interface RemoveOrGetAlertParams {
    user?: number,
    symbol?: string,
    lowerThen?: number,
    greaterThen?: number,
    _id?: string
}

export class PriceAlert {
    @prop({required: true})
    user: number

    @prop({required: true})
    symbol: string

    @prop()
    lowerThen: number

    @prop()
    greaterThen: number

    @prop()
    lastCheckedAt: Date
}

export interface PriceAlertItem extends PriceAlert {
    _id: string
}

// Get PriceAlertModel model
const PriceAlertModel = getModelForClass(PriceAlert, {
    schemaOptions: {timestamps: true},
    options: {
        customName: 'priceAlerts'
    }
})

// Get or create user
export function addPriceAlert({user, lowerThen, symbol, greaterThen}: AddPriceAlertParams): Promise<null> {
    return new Promise(async (rs, rj) => {
        const lastCheckedAt = new Date();

        try {
            await PriceAlertModel.create({user, lowerThen, symbol, greaterThen, lastCheckedAt} as PriceAlert);

            rs();
        } catch (e) {
            rj(e)
        }
    })
}

export function getUniqSymbols(number: number): Promise<string[]> {
    return new Promise(async (rs, rj) => {
        try {
            // Последнее время проверки должно быть не меньше этого
            const secondsAgo = 30;
            const dateToCheck = new Date(new Date().getTime() - secondsAgo * 1000);

            const data = await PriceAlertModel
                .find(
                    {
                        $or: [
                            {lastCheckedAt: null},
                            {lastCheckedAt: {$lte: dateToCheck}}
                        ]
                    },
                    {symbol: 1})
                .sort({lastCheckedAt: 1})
                .limit(number)
                .lean();
            const allSymbols = data.map(elem => elem.symbol);
            const uniqSymbols = Array.from(new Set(allSymbols));

            rs(uniqSymbols)
        } catch (e) {
            rj(e);
        }
    })
}

// Вернет массив сработавших алертов
export function checkAlerts({symbol, price}): Promise<PriceAlertItem[]> {
    return new Promise(async (rs, rj) => {
        try {
            const triggeredAlerts = await PriceAlertModel.find({
                symbol,
                $or: [
                    {lowerThen: {$gte: price}},
                    {greaterThen: {$lte: price}}
                ]
            })

            // Актуализируем timestamp о последней проверке
            await PriceAlertModel.updateMany({symbol}, {$set: {lastCheckedAt: new Date()}})

            rs(triggeredAlerts);
        } catch (e) {
            rj(e);
        }
    })
}

export function getAlerts({symbol, user, _id}: RemoveOrGetAlertParams): Promise<PriceAlertItem[]> {
    return new Promise(async (rs, rj) => {
        try {
            const params: RemoveOrGetAlertParams = {};

            symbol && (params.symbol = symbol.toUpperCase())
            user && (params.user = user)
            _id && (params._id = _id)

            const alerts = await PriceAlertModel.find(params)

            rs(alerts);
        } catch (e) {
            rj(e);
        }
    })
}

export function removePriceAlert({symbol, _id}: RemoveOrGetAlertParams): Promise<null> {
    return new Promise(async (rs, rj) => {
        try {
            const params: RemoveOrGetAlertParams = {};

            symbol && (params.symbol = symbol.toUpperCase())
            _id && (params._id = _id)

            if (!Object.keys(params).length) {
                rj('Не указанны параметры');
                return;
            }

            await PriceAlertModel.deleteMany(params)

            rs();
        } catch (e) {
            rj(e);
        }
    })
}
