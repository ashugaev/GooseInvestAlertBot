import {prop, getModelForClass} from '@typegoose/typegoose'
import {Modify} from "Modify";
import {MarketInstrument} from "@tinkoff/invest-openapi-js-sdk/build/domain";
import {RemoveOrGetAlertParams} from "./PriceAlert";

interface ShiftEventDataItem {
    currentPrice: number
    maxPrice: number
    minPrice: number
    growPercent: number
    fallPercent: number
    sumVolume: number
    instrument: MarketInstrument
}

export interface ShiftsData {
    [key: string]: ShiftEventDataItem[]
}

export class ShiftEvents {
    @prop({required: true})
    user: number

    @prop({required: true})
    time: number

    @prop({required: true})
    days: number

    @prop({required: true})
    targetPercent: number

    @prop({required: true})
    data: ShiftsData
}

export const ShiftEventsModel = getModelForClass(ShiftEvents, {
    schemaOptions: {timestamps: true},
    options: {
        customName: 'shiftevents'
    }
})

export interface ShiftEventItem {
    _id: string
    user: number
    time: number
    days: number
    targetPercent: number
    data: {
        [key: string]: ShiftEventDataItem[]
    }
}

export function createShiftEvents(items: ShiftEventItem[]): Promise<null> {
    return new Promise(async (rs, rj) => {
        try {
            await ShiftEventsModel.create(items);

            rs();
        } catch (e) {
            rj(e)
        }
    })
}

type ShiftEventItemFindParams = Modify<ShiftEventItem, {
    time: object | number,
}>

/**
 * Присылает по времени события по указанному времени и меньше (что бы точно не пропустить что-нибудь)
 */
export function getShiftEvents({time}: Partial<ShiftEventItem>): Promise<ShiftEventItem[]> {
    return new Promise(async (rs, rj) => {
        try {
            const params: Partial<ShiftEventItemFindParams> = {};

            time && (params.time = {$lte: time})

            const shifts = await ShiftEventsModel.find(params);

            rs(shifts);
        } catch (e) {
            rj(e)
        }
    })
}


export function removeShiftEvent({_id, user}: Partial<ShiftEventItem>): Promise<number> {
    return new Promise(async (rs, rj) => {
        try {
            const params: RemoveOrGetAlertParams = {};

            user && (params.user = user)
            _id && (params._id = _id)

            if (!Object.keys(params).length) {
                rj('Не указанны параметры');
                return;
            }

            const {deletedCount} = await ShiftEventsModel.deleteMany(params)

            rs(deletedCount);
        } catch (e) {
            rj(e);
        }
    })
}
