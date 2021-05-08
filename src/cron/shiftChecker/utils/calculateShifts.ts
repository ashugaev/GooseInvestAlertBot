import {wait} from "../../../helpers/wait";
import {stocksApi} from "../../../helpers/stocksApi";
import {getDatesBackFromToday} from "../../../helpers/getDatesBackFromToday";
import {log} from "../../../helpers/log";
import {generateShiftsData} from "./generateShiftsData";

const daysBackToCheck = 30;
const maxRetries = 3;

export const calculateShifts = ({instruments, shifts}) => (
    new Promise<void>(async (rs) => {
        let timesRetried = 0;

        const {dateFrom, dateTo} = getDatesBackFromToday(daysBackToCheck);

        for (let i = 0; i < instruments.length; i++) {
            const instrument = instruments[i];

            log.info('iteration', i, 'of', instruments.length - 1, 'for', instrument.ticker);

            let candles = [];

            try {
                const data = await stocksApi.candlesGet({
                    from: dateFrom,
                    to: dateTo,
                    interval: 'day',
                    figi: instrument.figi,
                })

                candles = data.candles;
                timesRetried = 0;
            } catch (e) {
                if (timesRetried >= maxRetries) {
                    timesRetried = 0;
                    log.error('Skipped item in shift checker', instrument);

                    continue;
                } else {
                    log.info('retry to get', instrument)
                }

                i--
                timesRetried++

                await wait(30000)
                continue;
            }

            if (!candles.length) {
                continue;
            }

            generateShiftsData({shifts, instrument, candles})

            // что бы не выпилить всю квоту
            await wait(2000)
        }

        rs();
    })
);
