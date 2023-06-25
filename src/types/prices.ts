/**
 * Стандартный интерфейс массива с ценами
 */
import { InstrumentsList } from '@/models'

// TODO: Переделать на объект
// TODO: Сделать 'data' обязательным
export type TickerPrices = Array<
  [ticker: string, price: number, tickerId: string, data?: InstrumentsList]
>
