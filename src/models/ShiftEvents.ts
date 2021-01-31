import {prop, getModelForClass} from '@typegoose/typegoose'

interface ShiftEventDataItem {
    currentPrice: number
    maxPrice: number
    minPrice: number
    growPercent: number
    fallPercent: number
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

export function getShiftEvents({time}: Partial<ShiftEventItem>): Promise<ShiftEventItem[]> {
    return new Promise(async (rs, rj) => {
        try {
            const params: Partial<ShiftEventItem> = {};

            time && (params.time = time)

            const shifts = await ShiftEventsModel.find(params);

            rs(shifts);
        } catch (e) {
            rj(e)
        }
    })
}
