import {prop, getModelForClass} from '@typegoose/typegoose'

export class Shift {
    @prop({required: true})
    time: number

    @prop({required: true})
    percent: number

    @prop({required: true})
    days: number

    @prop({required: true})
    user: number
}

// Get User model
const ShiftModel = getModelForClass(Shift, {
    schemaOptions: {timestamps: true},
    options: {
        customName: 'shifts'
    }
})

interface CreateShiftParams {
    user: number,
    time: number,
    percent: number,
    days: number,
}

export function createShift({percent, time, user, days}: CreateShiftParams): Promise<null> {
    return new Promise(async (rs, rj) => {
        try {
            await ShiftModel.create({user, time, percent, days});

            rs();
        } catch (e) {
            rj(e)
        }
    })
}
