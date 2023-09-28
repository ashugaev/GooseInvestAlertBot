import { binance } from '@/marketApi/binance/utils/binance'

export const getTicks = async ({
  startTime,
  fromId,
  symbol,
}: {
  symbol: string
  fromId?: string
  startTime?: number
}) => {
  const params: {
    symbol: string
    fromId?: string
    startTime?: number
    endTime?: number
    limit?: number
  } = {
    symbol: symbol.toUpperCase() + 'USDT',
    limit: 1000,
  }

  if (startTime) {
    params.startTime = startTime
  }

  if (fromId) {
    params.fromId = fromId
  }

  const newTicks = await binance.aggTrades(params)

  return newTicks
}
