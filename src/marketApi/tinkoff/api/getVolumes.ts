import { CandleInterval } from 'tinkoff-invest-api/cjs/generated/marketdata'

import { tinkoffApi } from '@/app'
import { ESfhitTimeframes, SHIFT_TIMEFRAMES } from '@/commands/shift'
import { log } from '@/helpers'
import { wait } from '@/helpers/wait'
import { EMarketDataSources } from '@/marketApi/types'
import { getInstrumentsBySourceCache, InstrumentsList } from '@/models'
import { volumesAlertCache } from '@/models/VolumeAlert'
import { volumesModelCache } from '@/models/Volumes'

const logPrefix = '[TINKOFF VOLUMES UPDATER]'

const getPrioritizedVolumeInstruments = async (): Promise<{
  socketInstruments: InstrumentsList[]
  manualCheckInstruments: InstrumentsList[]
}> => {
  const allAlerts = volumesAlertCache.items.filter(
    (item) => item.source === EMarketDataSources.tinkoff
  )
  const allInstruments = await getInstrumentsBySourceCache(
    EMarketDataSources.tinkoff
  )

  const alertsCountByInstrumentId = allAlerts.reduce<Record<string, number>>(
    (acc, alert) => {
      if (!acc[alert.tickerId]) {
        acc[alert.tickerId] = 0
      }

      acc[alert.tickerId]++

      return acc
    },
    {}
  )

  const sortedByPopularity = allInstruments.sort((a, b) => {
    return alertsCountByInstrumentId[b.id] - alertsCountByInstrumentId[a.id]
  })

  const socketInstruments = sortedByPopularity.slice(0, 300)
  const manualCheckInstruments = sortedByPopularity.slice(300)

  return {
    socketInstruments,
    manualCheckInstruments,
  }
}

let prevWebsocketsInstrumentsStr = ''
let socketUnsubscribe: () => void

const startWebsocket = async (instruments) => {
  const instrumentsStr = instruments.map((el) => el.id).join('')

  // If input the same - return
  if (prevWebsocketsInstrumentsStr === instrumentsStr) {
    return
  } else {
    prevWebsocketsInstrumentsStr = instrumentsStr
  }

  try {
    // Last iteration unsubscribe
    socketUnsubscribe?.()

    const timeframeInWebsocket = ESfhitTimeframes['1M']

    const unsubscribe = await tinkoffApi.stream.market.candles(
      {
        instruments: instruments.map((el) => ({
          figi: el.id,
          interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
        })),
        waitingClose: false,
      },
      (data) => {
        volumesModelCache.volumeSignal({
          timeframe: timeframeInWebsocket,
          amount: data.volume,
          tickerId: data.figi,
          candleCreatedTime: data.time.getTime(),
        })
      }
    )

    socketUnsubscribe = unsubscribe

    tinkoffApi.stream.market.on('error', (error) => {
      console.log('stream error', error)
      startWebsocket(instruments)
    })

    tinkoffApi.stream.market.on('close', (error) => {
      console.log('stream closed, reason:', error)
      startWebsocket(instruments)
    })
  } catch (e) {
    log.error(logPrefix, 'Error in websocket', e)
  }
}

export const tinkoffVolumesUpdater = async (): Promise<
  Record<string, number>
> => {
  // Большой цикл содержит больше вычисление и является оптимизацией
  while (true) {
    try {
      const { socketInstruments, manualCheckInstruments } =
        await getPrioritizedVolumeInstruments()

      // Бот запускается на холодную, поэтому нужно подождать пока все инструменты будут загружены
      if (!socketInstruments.length) {
        wait(1000)
        continue
      }

      startWebsocket(socketInstruments)

      const startTime = Date.now()
      const workTime = 1000 * 60 * 2
      const finishTime = startTime + workTime

      // Optimal interval in the case if bot will be broken for a few hours
      const timeframe = ESfhitTimeframes['5M']
      const candlesToRequest = 100 // TODO: Find biggest available value
      const candleTime = SHIFT_TIMEFRAMES[timeframe].lifetime
      const allCandlesTime = candlesToRequest * candleTime

      let i = 0
      let marketOpen = false

      let timer = new Date().getTime()

      // The small loop only makes the request itself without extra computations and fetching data from the database
      // New alerts will start working after 2 min
      // Limit tink: 300rpm
      while (Date.now() < finishTime) {
        try {
          const item = manualCheckInstruments[i]
          // Get all possible candles because quota per req
          const res = await tinkoffApi.marketdata.getCandles({
            figi: item.id,
            interval: CandleInterval.CANDLE_INTERVAL_5_MIN,
            from: new Date(new Date().getTime() - allCandlesTime),
            to: new Date(),
          })

          if (res.candles.length) {
            marketOpen = true
          }

          res.candles.forEach((candle) => {
            volumesModelCache.volumeSignal({
              timeframe: timeframe,
              amount: candle.volume,
              tickerId: item.id,
              candleCreatedTime: candle.time.getTime(),
            })
          })

          if (i >= manualCheckInstruments.length) {
            i = 0
            log.info(
              logPrefix,
              'All instruments update time',
              Date.now() - timer
            )

            timer = new Date().getTime()
          } else {
            i++
          }
        } catch (e) {
          log.error(logPrefix, 'Small cycle failing', e)
          await wait(500)
        }
      }

      if (!marketOpen) {
        await wait(1000 * 60 * 5)
      }
    } catch (e) {
      log.error(logPrefix, 'Big cycle failing', e)
      await wait(500)
    }
  }
}
