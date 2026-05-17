import * as fs from 'fs'
import * as path from 'path'

import { DetectorConfig } from '@/features/pumpDetect/pumpDetect.constants'

export interface ConfigForSignalChannel {
  name?: string
  directionRequired?: boolean
  tickerInBigLetters?: boolean
  tickerWithHash?: boolean
  priceRequired?: boolean
  keyWords?: string[]
  or?: string[]
  disabled?: boolean
  futures?: boolean
  manualInputPercentOverrideSignalPrice: boolean
  ignoreSignalsWithoutTPSL: boolean
  manualInputPercentAsFallbackForLackOfSignalTPSL: boolean
  removeNotFinished: boolean
}

interface ChannelsConfigFile {
  tradeConfigByChannel: Record<string, DetectorConfig>
  monitorConfigByChannelId: Record<string, ConfigForSignalChannel>
}

const CONFIG_FILENAME = 'channels.json'
const EXAMPLE_FILENAME = 'channels.example.json'

// Resolve from the project root so that the same config works in `dev:watch`
// (cwd=repo root) and after `npm start` (cwd still repo root, dist/ is separate).
const resolveConfigPath = (): string => {
  const cwd = process.cwd()
  const userPath = path.join(cwd, CONFIG_FILENAME)
  if (fs.existsSync(userPath)) return userPath
  return path.join(cwd, EXAMPLE_FILENAME)
}

const readConfig = (): ChannelsConfigFile => {
  const raw = fs.readFileSync(resolveConfigPath(), 'utf-8')
  return JSON.parse(raw) as ChannelsConfigFile
}

const config = readConfig()

export const tradeConfigByChannel = config.tradeConfigByChannel
export const monitorConfigByChannelId = config.monitorConfigByChannelId
