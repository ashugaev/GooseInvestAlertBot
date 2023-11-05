import { ChannelsToTrack } from '@/features/pumpDetect/pumpDetect.types'

require('dotenv').config()

const isTestMode = process.env.NODE_ENV === 'development'

export const logPrefix = '[PUMP DETECT]'

export interface DetectorConfig {
  allowedUTCHours: number[] | null
  mustBeRoundHour: boolean
  debugMessagesTracker: boolean
  buyAmount: number
}

