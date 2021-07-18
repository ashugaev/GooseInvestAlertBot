import { getPercent } from '../../../helpers/getPercent'
import { MarketInstrument } from '@tinkoff/invest-openapi-js-sdk/build/domain'

interface IShiftValue {
    currentPrice: number;
    maxPrice: number;
    minPrice: number;
    growPercent: number;
    fallPercent: number;
    sumVolume: number;
    instrument: MarketInstrument;
}

export const generateShiftsData = ({ shifts, instrument, candles }) => {
  const instrumentType = instrument.type
  const currentPrice = candles[candles.length - 1].c

  candles.reduceRight((acc, candle, i) => {
    const dayNumber = candles.length - i
    const sumVolume = candles.slice(dayNumber * -1).reduce((acc, candle) => candle.v + acc, 0)

    // if empty
    acc.min === null && (acc.min = candle.l)
    acc.max === null && (acc.max = candle.h)

    // if hot empty
    acc.min = candle.l < acc.min ? candle.l : acc.min
    acc.max = candle.h > acc.max ? candle.h : acc.max

    const shiftValue = {} as IShiftValue

    shiftValue.currentPrice = currentPrice
    shiftValue.maxPrice = acc.max
    shiftValue.minPrice = acc.min
    shiftValue.growPercent = getPercent({ initialValue: acc.min, diff: currentPrice - acc.min })
    shiftValue.fallPercent = getPercent({ initialValue: acc.max, diff: acc.max - currentPrice })
    shiftValue.sumVolume = sumVolume
    shiftValue.instrument = instrument

    shifts[dayNumber] = shifts[dayNumber] ?? {}
    shifts[dayNumber][instrumentType] = shifts[dayNumber][instrumentType] ?? []
    shifts[dayNumber][instrumentType].push(shiftValue)

    return acc
  }, { min: null, max: null })
}
