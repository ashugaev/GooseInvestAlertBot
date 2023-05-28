import { ChannelsToTrack } from '@/features/pumpDetect/pumpDetect.types'

require('dotenv').config()

const isTestMode = process.env.NODE_ENV === 'development'

export interface DetectorConfig {
  allowedUTCHours: number[] | null
  mustBeRoundHour: boolean
  debugMessagesTracker: boolean
  buyAmount: number
}

export const configByChannel: Record<ChannelsToTrack, DetectorConfig> = {
  Whales_Pumping_Cryptocurrency: {
    allowedUTCHours: null,
    mustBeRoundHour: true,
    debugMessagesTracker: true,
    buyAmount: 10,
  },
  keklolkeklolkeklolkeklolkeklol: {
    allowedUTCHours: null,
    mustBeRoundHour: false,
    debugMessagesTracker: true,
    buyAmount: 0.11,
  },
}
