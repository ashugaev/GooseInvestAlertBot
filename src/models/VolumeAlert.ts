import { getModelForClass, prop } from '@typegoose/typegoose'

import { ModelCache } from '@/helpers/modelCache'
import { EMarketDataSources } from '@/marketApi/types'

export type VolumesMonitoringFormula = 'sma' | 'max'

export const FORMULA_TITLE_BY_KEY: Record<VolumesMonitoringFormula, string> = {
  sma: 'Simple Moving Average',
  max: 'Максимальный объем за период',
}

export class VolumeAlert {
  @prop({ required: true })
  botId: string

  @prop({ required: true })
  tickerId: string

  @prop({ required: false })
  user?: number

  @prop({ required: false })
  chat: number | null

  @prop({ required: true })
  percent: number

  /**
   * Candles count for using in formula
   */
  @prop({ required: true })
  candlesCount: number

  /**
   * Defines algorithm for monitoring
   */
  @prop({ required: true })
  monitoringFormula: VolumesMonitoringFormula

  @prop({ required: true, default: false })
  removed?: boolean

  @prop({ required: true })
  source: EMarketDataSources
}

export const VolumeAlertModel = getModelForClass(VolumeAlert)

export const volumesAlertCache = new ModelCache<VolumeAlert>({
  Model: VolumeAlertModel,
  logPref: '[VOLUMES ALERT MODEL]',
  filters: {
    removed: false,
  },
})
