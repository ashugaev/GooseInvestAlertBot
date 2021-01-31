import {getPercent} from "../../../helpers/getPercent";

interface IShiftValue {
    currentPrice: number;
    maxPrice: number;
    minPrice: number;
    growPercent: number;
    fallPercent: number;
}

export const generateShiftsData = ({shifts, instrument, candles}) => {
    const instrumentType = instrument.type;
    const currentPrice = candles[candles.length - 1].c

    candles.reduceRight((acc, candle, i) => {
        // if empty
        acc.min === null && (acc.min = candle.l);
        acc.max === null && (acc.max = candle.h);

        // if hot empty
        acc.min = candle.l < acc.min ? candle.l : acc.min;
        acc.max = candle.h > acc.max ? candle.h : acc.max;

        const shiftValue = {} as IShiftValue;

        shiftValue.currentPrice = currentPrice;
        shiftValue.maxPrice = acc.max;
        shiftValue.minPrice = acc.min;
        shiftValue.growPercent = getPercent({initialValue: acc.min, diff: currentPrice - acc.min});
        shiftValue.fallPercent = getPercent({initialValue: acc.max, diff: acc.max - currentPrice});

        const dayNumber = candles.length - i;

        shifts[dayNumber] = shifts[dayNumber] ?? {}
        shifts[dayNumber][instrumentType] = shifts[dayNumber][instrumentType] ?? []
        shifts[dayNumber][instrumentType].push(shiftValue)

        return acc;
    }, {min: null, max: null});
}
