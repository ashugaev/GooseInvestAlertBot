// Dependencies
import {prop, getModelForClass} from '@typegoose/typegoose'
import {InstrumentType} from "@tinkoff/invest-openapi-js-sdk/build/domain";

export interface AddPriceAlertParams {
    user: number,
    symbol: string,
    lowerThen?: number,
    greaterThen?: number,
    name: string,
    currency: string,
    type: InstrumentType,
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

    @prop()
    message: string

    @prop({required: true})
    name: string

    @prop({required: true})
    currency: string

    @prop({required: true})
    type: InstrumentType
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
export function addPriceAlert({
                                  user,
                                  lowerThen,
                                  symbol,
                                  greaterThen,
                                  name,
                                  currency,
                                  type
                              }: AddPriceAlertParams): Promise<PriceAlertItem> {
    return new Promise(async (rs, rj) => {
        const lastCheckedAt = new Date();

        try {
            const createdItem = await PriceAlertModel.create({
                user,
                lowerThen,
                symbol: symbol.toUpperCase(),
                greaterThen,
                lastCheckedAt,
                name,
                currency,
                type,
            } as PriceAlert);

            rs(createdItem);
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
                symbol: symbol.toUpperCase(),
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

export function removePriceAlert({symbol, _id, user}: RemoveOrGetAlertParams): Promise<number> {
    return new Promise(async (rs, rj) => {
        try {
            const params: RemoveOrGetAlertParams = {};

            symbol && (params.symbol = symbol.toUpperCase())
            user && (params.user = user)
            _id && (params._id = _id)

            if (!Object.keys(params).length) {
                rj('Не указанны параметры');
                return;
            }

            const {deletedCount} = await PriceAlertModel.deleteMany(params)

            rs(deletedCount);
        } catch (e) {
            rj(e);
        }
    })
}

// Вернет массив сработавших алертов
export function updateAlert({_id, data}: { _id: string, data: {} }): Promise<any> {
    return new Promise(async (rs, rj) => {
        try {
            const result = await PriceAlertModel.update({_id}, {$set: data})

            rs(result);
        } catch (e) {
            rj(e);
        }
    })
}

interface GetAlertsCountForUserParams {
    user: number
}

export const getAlertsCountForUser = (user: number) => new Promise(async (rs, rj) => {
    try {
        const params: GetAlertsCountForUserParams = {user};
        const alertsCount = await PriceAlertModel.find(params).count()

        rs(alertsCount);
    } catch (e) {
        rj(e)
    }
})
