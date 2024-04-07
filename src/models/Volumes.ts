import { ESfhitTimeframes } from '@/commands/shift'
import { getModelForClass, prop, ReturnModelType } from '@typegoose/typegoose'
import { wait } from '@/helpers/wait'
import { log } from '@/helpers'
import { PriceAlert, PriceAlertModel } from '@/models/PriceAlert'
import { ModelCache } from '@/helpers/modelCache'

const logPrefix = '[VOLUMES MODEL]'

/**
 * Stores volumes by timeperiod
 */
export class Volumes {
  @prop({ require: true })
  timeframe: ESfhitTimeframes

  @prop({ require: true })
  amount: number

  @prop({ required: true })
  tickerId: string

  @prop({ required: true })
  candleCreatedTime: number
}

export const VolumesModel = getModelForClass(Volumes)

class VolumesCache extends ModelCache<Volumes> {
  volumeSignal(item: Volumes) {
    // Check if exists
    // Update all levels of candles
  }
}

export const volumesModelCache = new VolumesCache({
  Model: VolumesModel,
  logPref: logPrefix,
})
