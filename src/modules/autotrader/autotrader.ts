export type AutotraderStockMarket = 'binance' | 'binanceFutures'

export interface AutotraderParams {
  symbol: string
  volume?: number
  side: 'SELL' | 'BUY'
  type?: 'MARKET' | 'LIMIT'
  slPercent: number
  tpPercents: number[]

  trailingStop?: boolean

  fallbackTPPercent?: number[]
  fallbackSLPercent?: number

  fallbackPercentOverrideSignalPrice: boolean
  ignoreSignalsWithoutTPSL: boolean
  useFallbackPercentForSignalWithoutTPSL: boolean

  stockMarket: AutotraderStockMarket

  /**
   * Required for logs and binding with other data
   */
  meta?: {
    messageId: number
    channelId: number
    message: string
  }
}

const errorHandlersByStockMarket: Record<
  AutotraderStockMarket,
  (error: Error) => void
> = {
  binance: (error: Error) => {
    // handle errors
  },
  binanceFutures: (error: Error) => {
    // handle errors
  },
}

export const autotrader = (params: AutotraderParams) => {
  // Validate input depending on stockMarket
  // Create binance trade
  // Create trade in db ?
  // Create checks for trade
  // Handle request errors depending on stockMarket
}
