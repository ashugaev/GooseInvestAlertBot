/**
 * Model for custom user bot tokens
 */

import {getModelForClass, prop} from '@typegoose/typegoose'


export class Bot {
    @prop({required: true})
      userId: number
    
    @prop({required: true, unique: true})
      tgToken: string
}

export const BotModel = getModelForClass(Bot, {
  schemaOptions: {timestamps: true},
})
