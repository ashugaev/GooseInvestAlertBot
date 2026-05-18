/**
 * Standard interface for a prices array
 */
import { InstrumentsList } from '@/models'

// TODO: Convert to an object
// TODO: Make 'data' required
export type TickerPrices = Array<
  [ticker: string, price: number, tickerId: string, data?: InstrumentsList]
>
