import {
  CandleInterval,
  SubscriptionInterval,
} from 'tinkoff-invest-api/cjs/generated/marketdata'

import { tinkoffApi } from '@/app'
import { wait } from '@/helpers/wait'
import { volumesModelCache } from '@/models/Volumes'
import { getCandleCreatedTime } from '@/helpers'
import { ESfhitTimeframes, SHIFT_TIMEFRAMES } from '@/commands/shift'

/**
 * - Getting volumes event
 * - Checking if candle is already esists
 * - If exists - updating it, if not - creating new
 *
 * TODO
 * - How to track more than 100 items
 */
export const tinkoffVolumesUpdater = async (): Promise<Record<string, number>> => {
  /*
  - получить инструменты
  - проирерироваться и по каждому и получить последнюю дневную/недельную
  - обновить свои локальные свечи (используя алгоритм шифтов)
  - сделать алгоритм триггера
   */
  try {
    // await wait(2000)
    //
    const res = await tinkoffApi.marketdata.getCandles({
      figi: 'TCS00A105WZ4',
      interval: CandleInterval.CANDLE_INTERVAL_DAY,
      from: new Date('2024-02-24T00:00:00.000Z'),
      to: new Date('2024-03-24T00:00:00.000Z'),
    })

    debugger

    const timeframeInWebsocket = ESfhitTimeframes['1M']

    const unsubscribe = await tinkoffApi.stream.market.candles(
      {
        instruments: getConfigs().slice(0, 300),
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

    tinkoffApi.stream.market.on('error', (error) =>
      console.log('stream error', error)
    )
    tinkoffApi.stream.market.on('close', (error) =>
      console.log('stream closed, reason:', error)
    )

    const MySubscriptions = await tinkoffApi.stream.market.getMySubscriptions()

    debugger

    return null
  } catch (e) {
    debugger
  }
}

function getConfigs() {
  return [
    {
      figi: 'TCS00A105WZ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QXGFHS6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107D74',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012F0B291',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01BX150V5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XH4W3N3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A105TR7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Z8KGGC3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102D46',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0116Q1YF0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000000006',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'ISSUANCEPRLS',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KP6T2B5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106J04',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105WR1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PNLY692',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105VQ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00K2JQWT1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105SL2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106CM2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1064G3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1046N6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XV43CN9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012G45RC0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG014LH73G8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011K06JZ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01JQM21Z7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KSNVG40',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1070L0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00S1L7459',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Z8KXRV9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107AQ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YNHBLM9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01BJBR2W0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NTDT6H6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105GE2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JYHMLM8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103SZ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105Y14',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105L27',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103DT2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JG7XG76',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1028H6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01J5NY1Z3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01L708XH5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104UV0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG014KC7YW4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GK3W839',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YQ6NDD5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102X18',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106EV9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106JZ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102LD1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0024TRF04',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107BH2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012F27YT0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102BK7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103935',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1057P8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105MN1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HY5JWH4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1068S9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PBZNWM4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107R29',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1043L7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106Z46',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1043Z7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105JP2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01HB90GP6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102FT9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00G9DSXZ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NHJGKN2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105JN7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RMZ2CW4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0148NSWQ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00L1HHZD4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1058K7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105GS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00FM98YG2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104VS4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105NA6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105518',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01HFSDQK9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'ISSUANCEBRUS',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105V82',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBGHUYNYA015',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104UF3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1064L3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007Z5F748',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105C51',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106F08',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105X80',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106Q47',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00CNJBLC4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01HZNHR95',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VL8HTK6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106KT0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104BY4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0115R0Z30',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0141LK3L0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1082W2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZZNPB92',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A101UD4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106CJ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00TGK62V9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105GV6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107RZ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106Z38',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QN37PX1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103F27',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R4XLRN5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106938',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PN9H616',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NTXZ6S3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00S1GXC62',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107AJ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B4MWD80',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS01A1067T9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106YL8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JRTXBC1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1051T3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012Q8FLM1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102DK3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1065B1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00K2B2M16',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106Y70',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y5TNGR6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PT0YSQ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011MDB894',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VY13C74',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01K26G634',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1074G2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1053A9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01LKSXHZ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NDMW359',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QKJ0N89',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01JJPZ6J9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01LT21VX0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104WS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DQFVRK3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG010JBJ976',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Q994JS7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NQBGZX5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JDS8JM8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106EP1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105575',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105L01',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012TMDX43',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1062M5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00J8B8QK7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Z84TTZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS01A107548',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01HQHKMJ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00WH118P2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106CU5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106888',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RQ1DXY5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105GW4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KN3YBL7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011FJ6573',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RHTYB60',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GCRTCX7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1049Y7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1077U6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105UZ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QJ5KYT2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105G99',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107C34',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A101GZ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106RJ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1074F4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106C92',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104TG3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0110WZC19',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105ZC6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GGS6C84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106656',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01HB67N61',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106DV1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105SZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0113H9XT2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105Q89',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG013PZT8B6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103117',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105YF2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00008WPG3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105HC4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107795',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107B84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105SF4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0104NZHS7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106P06',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105VP7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105M67',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GXQKMJ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012JC0J32',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105VL6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00PVT6KR6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00TJF05J0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VCY76T1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105SP3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1078S8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PKCLPS6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103133',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106GB6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105KP0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105K85',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106XT3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RTTRKD7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105CM4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106797',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XD2M5S2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104ZU1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011QKQ291',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01BJBTTH6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011MDDKK2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG015KF6013',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y4SQ1Y1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG013J0LT31',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104TM1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107HG1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y1B3FH4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R7TP2Y0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0036YHM96',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103WV8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0147H0889',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XPQYQV3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00V0WL952',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011933QS9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105PP9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01338VXJ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XK3QV47',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01LTWF5R3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011XYBDN9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01J99MBX3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00V93CKD3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG015C3V4J4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007Z5DF79',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KTV3B51',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NHLC0N5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107M32',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01HWXR8H8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QKPP373',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1071R5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106MW0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105MW2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'ISSUANCERESO',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106WZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1064X8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105YH8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01G7MDJQ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106DK4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106XD7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106VT7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y1Q22N4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y28DH67',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1065A3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105KR6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R6WV4J0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107TT9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01HX7J428',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103125',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006JCSQ92',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00K64TZR2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1056T2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01JZG9LW2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011MDBQV9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KS10DZ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107BL4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1042W6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B8SX525',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105849',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R2FH979',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A107T27',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107FN1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00425VG07',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106607',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106NT4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KJP9PN9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1059A6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007Z5DZS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QTDV828',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106FV6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1065C9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107TB7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1078X8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01K26P8Y6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105H98',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1060X6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01JM5P9G7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01J7SQ5D4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106C50',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106E90',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105QL6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PXD3X94',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1057D4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XP7VH57',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QFLCT66',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012Q8FS55',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBGYAKUTV001',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00WLLSRP2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105WP5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KS0ZWZ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011Y7LMW6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS0109ZMRP0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105CF8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01HCSNJD5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01HQ3QWT6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KR58B73',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1061L9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1082G5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GF6BJZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00L9H7QZ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00FRWYRH1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A108132',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106CR1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106V57',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105A87',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103KJ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103S14',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NN90XV7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0105J8GK5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104L36',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1032D7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107AG6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104SY8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1060U2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1080N5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107TK8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG014VTFQJ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1070G0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103WQ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011DV0155',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105AD7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01LXYNYC8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0089PCRC1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107EP9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107GV2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1035D0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105X64',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1077H3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00L2L5GP6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105XF4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1052T1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011YQCC65',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1065Y3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KT4VV56',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102TR4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00MMJ90B3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105BW5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105GN3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01LS40M22',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NZHNQH2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00N9Q06D4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011BV60Q0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1074E7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106K43',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105P07',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104WJ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KP65WH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103QH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1065M8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102Y66',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1050X7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106ZU6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104XE0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105AJ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104Z71',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XZ93N78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009LB6H99',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCSS0A105A95',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104UA4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107761',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011C669D9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104V26',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VDF2563',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1075S4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01HHNFTJ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00J5KZDG4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00V3L30M3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107E81',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103RT2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00J3T6HB5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YC4R9B2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KS6P459',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A103G83',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106672',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105KQ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002PD3452',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105JT4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VR72X38',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'RU000A106AH6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012C34FX0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00L1HHXK1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VDF68J9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1077X0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1040V2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00X0V9H83',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00G6V7252',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1063Z5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01237K1S0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KDTJJ04',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1066A1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102RU2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A101NJ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104CJ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007Z13SN3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01JFY08Z0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1059P4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01J3GKKC8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RRT3V69',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105PQ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107738',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011MLGP84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011PCJJH2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106SF2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PMK99X0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0107RVMG1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107UB5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QV17ZZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105ZW4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JKX1H22',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106CB5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Z0WNXM9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106037',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1058M3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00L42J441',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104WF9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011FJ4HS6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00J5KYZN8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103D37',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104JV3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RVF4P66',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NZHWSQ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107EL8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01172JM41',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1059N9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106GZ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01L9XJRL7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QXSLFN2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105TP1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106DP3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012NJPWN4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1053W3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KMWBXK3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01HDYRTB7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106VV3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG010GVNPK9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PYL6030',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VCVRQQ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JHB0ZL4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106A86',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1053P7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00V1JP1Y1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A107FG5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1068T7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107LU4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00TQHNK64',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105A04',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XRFV045',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00WCMMJ92',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00V92X4F6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00A1034X1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01K4S4Z88',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105M59',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JCTFXS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG015K977N7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105104',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107UU5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105M75',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DYFTK31',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105HN1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01JJMP6T6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106B51',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1066J2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GTVSP62',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105TY3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01HQGYGR5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107BD1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YJKHN65',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG013PS4RH1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00K7QTXX0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012SMKJQ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0105J8GV3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PC6QBX8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005K570Y9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107E99',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105LS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NLMHM55',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0116QGN40',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011WZQS21',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012CQ0V68',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KFLDC92',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PC4M4X3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0121GPL12',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106ZP6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00MNBSFR8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QPGLLB7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1056Q8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011YWXMV9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107TR3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1038D4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105RW1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106ZL5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105054',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105PH6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105NL3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00N8J90K7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103C95',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GSNVXC3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104ZC9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104FG2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HDD93V9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A3LSJ06',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106G31',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105KB0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KB9PDF0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1054W1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS20A0JXU14',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107W71',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105AX5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107CX7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107PM2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01236NFW3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104Z48',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105M91',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106516',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107C67',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LPNW7Y7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103S30',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KJ9F2L0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PV1JCS0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105UW5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'RU000A105XA5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00V9TL7F3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KT3CC24',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011FPCMW7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105RH2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106EZ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1065K2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102JB9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JGG2N11',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001CYCG37',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107S85',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01391D0C2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011MDDX15',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00V93GCX5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QYTBB95',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LLM12G8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NRGHQQ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YC5HLP8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104SJ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01GJ1FRZ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PGVLT83',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012G2PXW7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002V2YQY4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R7TNJ39',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1059R0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107084',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VHHC305',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1065S5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106HF5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0000JWX54',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GKQR8Z9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104A39',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1078H1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1071Q7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZX8S6G7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KN3X0W0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NTZTZ47',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DSS8W00',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00K4MPZ61',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102WL1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XYH8FH2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HYXLFQ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PNW0B21',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103N43',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105CS1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107EE3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011R60BN3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106DN8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XX7H140',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012JCD404',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1067H4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105SK4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105VR3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01L5QP0V7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107217',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1058U6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS20A1056U0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012SPY2V2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01K0SLMG3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103Q08',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104V75',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KRN02R0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZLH4MW3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107KV4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBGHUYNYA0X4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107B19',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104V00',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01K3WY9B1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0131NQLG8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105YQ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102RN7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012BTL6Y4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106375',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00P5B0SC9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00WYH0LS7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012NW2KW6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105SX7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R2HQKS7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XZ95JN7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01J35GSR4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NBJSLV4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107HR8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0110X9D23',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00H14LSL4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104XR2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1078L3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PBZNT41',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01J7V84Q6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1080Z9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011FHF1F7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106987',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105RG4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105WJ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1060Q0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0124VD0W1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HY74TD7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107456',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0120X4T49',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00WMMMHJ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00WFCV2B5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1030X9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NPGTY64',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0107GHR16',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00580HD20',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105JG1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107C59',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HVY2MS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105FM7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HT45YG5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1082X0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107B43',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01B19SXC7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RT7J0J2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107JY0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107SM6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01496C370',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KN3GKH2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PVL2PM1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG015CD9YL8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106169',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JQC5C47',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01JKRC5F4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105NH1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R0Z4YW8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104693',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XJF7FL9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1079S6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00K4MR057',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1075E4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YN4P9Q6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105YA3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZHZ4Q86',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Z6BQMY7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A105146',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'RU000A102T63',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106L67',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105QZ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QPG0TF9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012G07QT0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KYM3M97',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A106GC4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105YB1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012G2MQN5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG008387LJ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS163279959',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105FS4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105VC5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KD7BGM2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103828',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107D58',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1079H9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106EM8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107613',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0122KNFV4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1078Y6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107050',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106YE3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1041B2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107076',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105R62',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00CZCT9R8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QQ73R50',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QZ4PBD9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GH607J6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007Z5FFL1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107E08',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NQKW4B0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107YT9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1061A2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QTH5DF3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YHX6J06',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01JPJ2CR0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106AK0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00T22WKV5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1057A0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0149NW6B9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00K87T9V6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106SK2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1036E6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01JJ0F5B6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HKB9M89',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZH9RB82',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106565',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106UW3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107BR1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YGKVB04',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107EW5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00005V2L5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105PK0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1036X6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JQC34S1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103QK3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XH4RHP6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A105DS9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105QX1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1060Y4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011DV6S05',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105C44',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YMTR6J4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GSG5RB1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104WZ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107UW1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PNDYR58',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1062L7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107U81',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0000776S2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'RU000A105ZP8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A104WA0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01HMDD762',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00FB978L6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106144',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01LGGVP72',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107D33',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105SD9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1051U1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103RD6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107209',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0113G7SP1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y9145T6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1051E5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105BP9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GNG2N37',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011XNL8K6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105UU9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107G63',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01LTWT856',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VWZ21H5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JM15X21',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106YH6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0135CF8W1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG013BSN994',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104YT6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105W08',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106XM8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'ISSUANCESAMO',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NR70S66',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1068R1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105MP6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01K2753C1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102B97',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B9PJ7V0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012QRRBN7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105XG2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00WFBVRN9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JM14CY3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NQKWGH7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107BZ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107BP5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102GD1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106XP1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105Q97',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107TD3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0136Y8NS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011CG00T5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106PW3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1071U9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JLWSJK0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105CL6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01016H852',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00C7PQK43',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A1033X3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106YD5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KJP2PN5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103943',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103KA7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1080Y2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007KHNMS0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106862',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104ZK2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PZ6T956',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LLM4499',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZQYML62',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106540',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105H64',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105A61',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01JZY2QL1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QG1PSL0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1071S3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RKDZWG3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QZ4NY96',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R4C0L75',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106PY9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105NT6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GH12JY2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105C93',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZQT2640',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107746',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00S6QMBP8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106151',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NZHT902',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VWZ2229',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104362',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105TS5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00WFB0B30',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JX82779',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011PC1CT3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1076A0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106G56',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0113TYN83',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KD76W34',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00X0SRV34',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JQ3B6W2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102GU5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YG1RQV4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00SXFWRX7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105492',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106K35',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GTQYBZ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105JH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012Q8FDW8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105U00',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104Z89',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PM8S500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106T85',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106FW4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS01A107RH8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0000644P5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00V6NXQF4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZRZX9T8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106LS0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG010SC6Q70',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KHKGJZ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R4D6C68',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105ZX2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012827T82',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106AT1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01GM6M7R6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011KF5WV0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105PR5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RLS6TT4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000056Z49',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1050H0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00V9STNC5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105112',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KS0CW90',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103PX8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105KU0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104SX0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012STNNH6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KDTPXR7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'ISSUANCEVITA',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011616RM7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105N25',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KSL6M30',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105BY1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00F6NJY77',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00K53FX22',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00K53FBX6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01L0MMM82',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105EW9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104W33',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YJJPT66',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01LC2XW43',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012Y8J8C8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012LLKPC3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106A78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103G91',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0018V9PN0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106F40',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1057S2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1069N8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106AJ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106UM4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105EP3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105QW3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG013K08ZC0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105RU5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107VW9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00MT69C64',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A0ZZVE6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KB9VG76',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012F7Y8K5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LLCGZL5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1031K4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XV2BDX1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0129FDB02',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y90V3M0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QN36P08',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106FR4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105VU7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102VY6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106631',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KTDNXH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106HB4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HTLYK93',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KR1W3G3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NJ3YSN8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KHR8SP0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105DL4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00L92CX58',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QKHK9J0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y77GTP4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NTC1SR9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KDRYK53',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106FN3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00H0HVGD0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105RF6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0147HX1H8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1061K1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104XU6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104XW2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106U74',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00FVSZBH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1043E2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102TJ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105JU2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1074Q1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JS9D851',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104XJ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1049M2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A1006S9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011RXTDD0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00MTL7443',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1078V2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107W06',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103CD8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01LNRJ293',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106P97',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A104C78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105HH3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1055Y4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105658',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104Y15',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104W17',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YPG6YH3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106DJ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QRKJF13',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y04MGR7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104SU6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A101XD8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105SG2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107U40',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01DC7XWW9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R83JK91',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0000K94P9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105H23',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DY7RMW5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XV1FN94',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YPZF2Y2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00BRZQ4Y4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105P64',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107SH6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Q58ZXF2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105WH2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107SG8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012J4Q4W3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZHPT667',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106R95',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105C28',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00WCNNR91',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106RB3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y04Q3V7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0140BZS87',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1077V4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105V90',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YB8K0V8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00TCWB8X6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106K27',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1043G7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01LMW5190',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00D5L3Q99',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107GX8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105AW7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01J7T8052',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106R53',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KDRMG91',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0149GY1B3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105B11',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00K7DT3F5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107480',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107JN3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00MJPCX54',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00D6Q7LY6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GLT6144',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102BF7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103M85',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107L82',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01L90KW54',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1059Q2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00X5FK880',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01FVH2C22',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01KFSCQ78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01J7V2C39',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105427',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106P63',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105RZ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107W48',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1069P3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1053H4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1070X5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105Q63',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012YS2TP2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105HJ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00T7HZJG4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104735',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00J7HHGH1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0013J7V24',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0013HG026',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0013J7Y00',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0013HQ310',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0013HGFT4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0013HRTL0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0013J11P1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00D87WQY7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0013HSW87',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VJ5YR4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0013J12N1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VHQTD1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YTS96G2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CKVSG8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBCQD7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00FWP4JW4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JN4FXG8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DW34S2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FJ0RK9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BW90S6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDXGP9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BN56Q9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DY6735',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP46T2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012C7JST2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNWG87',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001J2MJH8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBHXQ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FD28T3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001C7PM75',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGD7W6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RMWQD4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0064N0ZZ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG014GJ8XH2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFJFX3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG008P7F869',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004PYF2N3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BZCKH3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GQGJT4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLK267',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0035LY913',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00N0PL198',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG016G0L0Q5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00TZNCJ75',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000B9YJ35',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GQSVC2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCPB71',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000P458P3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YQ7XR05',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DSQLQ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FY4S11',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DVB833',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRVP70',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BM5SR2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMQCP6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRW644',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CKGBP2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWS3F3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLYWX6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP3PW7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FLHZZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBPFB9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0058KMH30',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BT7JW9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RRGSJR4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBVDT8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS007940839',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZQRGW24',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DQLV23',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00G2HHYD7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DB3KT1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006473QX9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C19QW1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBQCY0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PPFKQ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DV7MX4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000P9D6W9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001WMKHH5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00BN969C1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FVZQY1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D7JKW9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLXZN1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003T4VFC2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFWF13',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000R7XX87',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A0HG602',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKTFN2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NV1KK7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BS4MP5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YDGX945',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002293PJ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ49H3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRD0D8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00BN96922',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DR0RZ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DNLMB0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQW085',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000KCZPC3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCHHM0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QP35H2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GTP1B6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQPC32',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0078Y1D92',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000B9YYH7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DJN7L9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLKK03',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00741Y1N2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y6QRDM9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000KTYB56',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H5G6L5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRXP69',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PNR1BT2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBD5N1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DR7LTG2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C8D8G9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QTF8K1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS009102396',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000V78V75',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCSC00001122',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMLVJ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FWGSZ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R2NHQ65',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG010JW9K49',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00FQ8T4G3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HXJB21',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWGYF8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FP1N32',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PKWCQ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BT5PG5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CYW7N5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000R2YFG7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWXBC2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DKCC19',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PQ4XJ45',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000KHWT55',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JM9XLN6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QV8FS02',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BS5170',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG010MW0N84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0025X16Y5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00W1PSSJ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RQBFV2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKFZM4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PXZFW2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BM6N47',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000JHS2L3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PCQQL6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BF0K17',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPWXK1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DQN9R3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B8N0HG1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004M9ZHX5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005Y3XWH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68CV8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VCYVLH4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DX9JV7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00MS4Y0W9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BH4R78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007BVZ8H9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01G9JKWV5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Z5KBW72',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000M1J270',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS4387E2054',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PRJ2Z9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RYC984',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBSJ28',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q7ZZY2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BY29C7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPXVJ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y6G6X31',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP4MH0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68C39',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQ74K1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BT2TP0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG008HNS333',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0320C1036',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BTT5B8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVDBY2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB7SX7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HD3DW5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRBX66',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG008GC8CP6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNJRZ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BM6788',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DSMS70',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DZJVH0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001V4SF46',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPPN67',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QF05R6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001B4BV87',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000L9CV04',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005PXTR70',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NFPF36',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKPL53',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QVJYGM9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q4XNV1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107UL4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWFH48',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRJL00',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F02T51',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJF1Z8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001Y04TN6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106YF0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BG5BL8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS0418T1088',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HS74G6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BX9WL1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BY2Y78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C496P7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0018SLDN0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XP8NQN4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RJL816',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBNYF6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00BN961G4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FDBX90',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBV4M5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB99S3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GXZ4W7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000T88BN2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLY663',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BT1ZY7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0081NLHR0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG017TGV7M2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0019T5SG0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWPR54',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005TJKDZ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009T22D49',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BZJQL8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C4ZZ10',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BC4185',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CSRSG6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00D2Z7X83',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPBVW5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJVN28',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS5407L2079',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RKXRQ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C4QP94',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003222R31',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSC0K9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D0FNV3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HY28P97',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009XW2WB8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGKTF9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0014XR0N5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HFFRW39',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009WR3FL5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS0835G2057',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00J76TKS1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG019980TD4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNDN65',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000G3QLY3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS0269L1044',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004RVFCY3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68JR8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C7LMS8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VSH86G4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000KMVDV1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00H1CY328',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C6CFJ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRJ809',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVMG26',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSLZY7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BZ3PX4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LD9JQ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMWV95',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F86GP6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RCNQMX3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP1Q11',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCWSS3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NJ96L6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002GHV6L9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ26K7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GQPB11',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007NLG4L3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000P2MRM9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BXM6V2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BW3299',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007KC7PB0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A0ZZAC4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BL8476',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F369C7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKWM80',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000G0Z878',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003BW05K6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FQRVM3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HXNN20',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS009124010',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QNSY1H7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DHPN63',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001P63B80',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BN84F3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0042V6JM8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01B9G0GS3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CB8Q50',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKY1G5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKZTP3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BTT3D1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LPTHYD5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H6K1B0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWBW76',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVYN55',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BT41Q8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSV0W5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPH299',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000K1T9L0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DHTYPH8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000MQF8G6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BS5CM9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RGM5P1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D7RKJ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NN6QG15',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMDBZ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CHSS88',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000G3YP84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B6G7GL7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YJ7NBQ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HQ1LB3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVXFK6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VY1MYW7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0064N2T78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00D0Y81M1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000P7S7L7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001Y2XS07',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001M2SC01',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BM2FL9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHJWG1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GTY47H0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001C7PMJ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ35N5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BTKR92',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00CZNLR47',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNPS52',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011386VF4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSBZH7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H3YXF8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG008HBD923',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F395V1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BW6JV4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BH3GZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BV95H9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKYVF0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S685M3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJZ7V7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007GNPYY7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ41X2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BR37X2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00BT7PPY8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLMXN8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D8KTN6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0029SG1C1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCQZS4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C2V3D6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GW06J7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB0V03',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001B17MV2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C3NTN5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBKZD8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLFNC0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001D0HB36',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPZBB6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003PGJHP5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGKJ70',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007DHGNJ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GKS1G03',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105EX7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LR8515',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQQH30',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CC7LQ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00X7L1C14',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJSJT2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLV2Q3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005PG80K4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KHHBMC5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKD3K9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000G25P51',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000G3TQV2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000KT0GV3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BT13B3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0039320N9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LNHHJ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DLVDK3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BH5DV1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG013QNJHP8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0029SFXB3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BTCH57',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CGWSJ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C4PLF7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHJSC4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB4HM6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB5B84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107JE2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZHCX1X2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP0KQ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QKXH20',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006JS5785',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLN497',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A0JPP37',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DH7JK6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00S1LR2C3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000L69KL5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S689R0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000MBHNC8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002GBMZG4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRXTR8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000J3D1Y8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGYWY6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBGQF1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005L86G05',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FXML90',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C04224',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHGDH5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A106XF2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D86F25',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007FG0C23',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CJ2181',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVKWW0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHYT80',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS2207L1061',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGPTV6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BL9MZ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000N26V95',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D898T9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HSLV70',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005ZVK9P2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00FWQ4VD6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWB7V4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LG6G08',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGKHZ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0025Y4RY4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMQPL1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000SK7JS5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJTZX0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000JK9DK4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000KQY8Y7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PTLGZ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DXDL6Q1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PZ0833',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H8R0N8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C4Z6C2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQGLS5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CHPMY5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F6YPH8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y9WVZ76',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB8SW7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00H19F184',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0022FDRY8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNGBW9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HCY3Q67',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C41023',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C2PW58',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CDZLV8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWQFY7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002458LF8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQHGR6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BS9489',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJBXZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BX28M0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DCCZW2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLMDQ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001R1GCT0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HLJ7M4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCMWM1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QK0TG5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB5792',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJX8C8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00BTJVK94',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DYNJGH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009CL6VK3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000R33BD1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMFNP4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001KS9450',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007N0Z367',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009S39JX6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00F0SW7N8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0016XJ8S0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005F1DK91',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68829',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPMH90',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F5VVB6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KHRRDX3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BC1L02',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R4Z2NT4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS377381088',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCQ4P6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VWV3Z5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BR14K5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS009086904',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS002614686',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00BCQJ2X3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LWZDYB9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PNTXP0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0018SLC07',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLRP41',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000MQ1SN9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBR9P6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q5BQ63',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BM9RH1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGGBT8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C2L2L0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009PH3Q86',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PXTGY5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y7BP8Y1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C3CWZ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKXYX5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000JG0547',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FFC0B3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00MJDR6J9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BTQR96',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLZRJ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFXHL6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BT0J38',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000L4M7F1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJD7C2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VQWH86',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0022FMPD5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LRYR36',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A0JNXF9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C3W281',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001K61W36',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H9G7X2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004WQKD07',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BK9W84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011P2TCH8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006KY4KF4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLRT07',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFL116',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002WLDMW5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001MKZGY7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWNV93',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C1XSP8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012W99DN6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CTGXS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZHT7FY2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BX24N8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BV4XJ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00P33SY72',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB1TH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GPXKX9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A0JV532',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H8LGK2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNTTY4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005BT60Y8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0035WV4N9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHQJX3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLW530',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GQ7K93',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00D8JC882',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CCFB17',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YJKWXD8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LCK3Q2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R2K8TF5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCD3D5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HPNDX5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0145KL747',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VC0T95',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00L0YTFN8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB6WG8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS4346Y1038',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0016XR1Q8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKLH74',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BG7L34',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009DTD8H2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0078Q6BC4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GZQ728',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG014L7D4G1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68507',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004730ZJ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGLRN3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RP2T9T6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00F6NKQX3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNNYW1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFZVH8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C3G9J2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006F8QZK4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NNW8JK1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGFGT8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BK9YW3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0016YQTR5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C8NJ10',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FKJRC5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F7RCJ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68758',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CTSZQ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006KDCHJ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C3FGH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00SSQFPK6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00629NGT2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S683W7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHPL78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VJ17DS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BTYP37',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QWR4M8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000G6Y5W4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DYGNW7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009DFHWG6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG012YQ6P43',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002BC7WC5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105NV2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FLZN98',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HJ8K617',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F1ZSQ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000TRZNP2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG008F2T3T2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BL6CB5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00BGKYH17',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GQK3WB5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZKY1P71',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A0F61T7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLW102',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PNN7C40',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D2M0Z7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001BBGNS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F964B6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSZ738',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003MSMCS6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00FX58Q66',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005DLMMZ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C1DF05',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QQ8C789',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBK2X9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS0086E1082',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GF8K4W4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000B9ZLB0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0026ZFZC4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CM6L31',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FKMP26',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVHBM1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01BGVGG87',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ2D31',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQBYR3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00F17NDH7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000TRJ294',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS814751064',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005XR47P5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001YKDND6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q1R1Y9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSMFN2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFSND8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWSV34',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCSST7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B0THY80',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GBZ3J2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005D7QCJ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002V87SD0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BYYLS8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0135B2214',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01BFR8YV1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CJXNB5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BK28N7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHG9K0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004730N88',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00441QMJ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BD8ZK0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BS2ZD1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C1SRH5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BG4202',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00L2B8KW8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFJT36',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNGTQ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H01H92',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0025XVR85',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJQWD2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002H1K1H1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BN6KG8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCVMH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C2ZCH8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLNNH6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PLQ1JR1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PYX812',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NDV1D4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CPCVY1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BW6P59',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007BBS8B7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKDWB5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDWT45',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZXBJ153',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RQ732B6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKZ1H3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B6G8077',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDCM24',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLPBL5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BD2167',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D9KWL9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BF0155',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFNTD0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DLY9B9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00MP10H94',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H556T9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVQRY3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C9K8K4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PMBV39',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A105BN4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0028ZMP45',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBXLW4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C22QV7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y3XYV94',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSJK37',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00J7CBVW8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LC1FS4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BYRGX1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZGF7771',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001MB89V6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DY3K39',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00S4VMQT2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F8RCH1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R0ZFHV4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0059JSF49',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BF4D19',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BZ2QG2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJCDS3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Q70B3V1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LLV9WW6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C1HN22',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HY6V6H5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68CP5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PMSK08',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00SDHC8D1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HGYNZ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R45JYB7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJBZ23',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QBR5J5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0026ZJRY4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001V9NSB4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PPS73P4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001J2M542',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKWSR6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0043BYPB8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0018FQNS6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PXDL44',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCVG28',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWMX63',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKZB36',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001QYNR63',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKTXF2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BX8DC4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GCSWR5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C1FPY4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C4GBR6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009J8K7M0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG019C1BQR4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S686N0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GMGNB3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001LFLZZ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQQ2S6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BC4JJ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BC26P7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPWGR1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BTR593',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001RWPDW6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00M1CKSK7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KXRCDP0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00172J7S9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNPSQ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68B31',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CYZ1K8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DSLKXX3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BC7VW9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BF8CN3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00TX393L4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0025DTRN5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CTQBF3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCKGW7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFNR17',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CL9JV4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPH459',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BV4DR6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B6KGNN1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BL0T06',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSSC44',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0029SNR63',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBL0Y1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003QBJKN0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CGC1X8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NS26Q8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BF33K1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNNKG9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PQPCM6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000P5LMQ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDSLD7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C4LN67',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GNC8DL2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG010JBYV98',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q3RGN4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FC7366',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBTJZ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H3FZM6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0015XMW40',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y6QRNM7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCZYD3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNFLM9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001JZPSQ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GXRNJP4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00SDJ8M78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHP8J4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BR2TH3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0026ZJ304',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000G2GJT7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKFBD7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00H5S8391',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VG1034',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C0G1D1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0019GM953',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BG1SX2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0026ZJQX7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DN4ZT1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CKGDS5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJGGV8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBDZG3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CTV4N4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000K4WS65',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ81C1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBMNG0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000JH6683',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHKYH4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQSQ38',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000R04X57',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01282ZHB3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003PHHZT1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BTC2N0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PWTD92',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CPBCL8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBS9F6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000L5CJF3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C23PB0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C2SBZ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000B9XRY4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LYF3S8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWVSR1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BF0V40',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003PS7JV1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LJS6B8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS3073E1055',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLBVN4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000MZL2S9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003PDKJF7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DGWV035',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QY4ZD0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0118JXCD9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007GJ2F81',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGLFP7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000N7MXL8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CZ8W54',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XGCHFV7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C46HM9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107ER5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BK2F42',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C3VHF1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BL0P40',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003H0XV18',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004RVFFC0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C5HS04',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BTVJ25',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D8RG11',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QSXPZ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BH6360',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00H9MNDZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005CPNTQ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JXPFBN0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68DD6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C42VX0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BD53V2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CH7WB8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0029KJVB0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00L3B3R02',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCRJM5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BS5DR2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMBL90',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DQBZJ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68598',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0021PH456',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG018KZQ6K7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BF6RQ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDWF36',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CHNH78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKXWV1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F6F1G3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005497GZ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007TJF1N7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQ8KV2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FJH8W0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BH3F20',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001R3MNY9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000P2TYL8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0037X6HX3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QKNLB2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QVJV6V4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00N9MJTZ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP6D06',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LJYS1P8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HCXFS4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DCGRL8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDGHD9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001WTBC36',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BXB1M5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GRZDV1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PKZDX4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HT5G06',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BYQ0B1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMNBY1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F1ZSN5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NYJKS4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BF3WW4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D2JB50',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQSBB2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A0JNAB6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C15114',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LF8708',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000MTDW24',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG008HNHZ07',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GFMPRK0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001J2QYS9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVVQQ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LW7YK82',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C7B436',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00K20GVD2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BF0672',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVP5P2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BZX1N5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F6ZWH2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0059FN811',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LPWLFD4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QM0RZ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0136WM1M4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CC53X1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006DZTJ56',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001KJ2HM9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q1GK24',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0073DM784',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NQGF05',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG008HD3V85',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NVSBL7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B0FS947',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00FQH6BS9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BXTPV3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S688G4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001KFKQM7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GQJPZ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001KWWRS9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DM2BF3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DYPZ4T0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00P4RBR99',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XKM1DC3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003NXJNH6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004730RP0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C4QB95',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBDV81',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VLBCQ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000V07CB8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLMY92',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001R72SR9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CTM4J9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFVXX0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000J094P3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS0760G1031',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C4SKT1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QV37ZP9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLHRS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DRM643',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D9DMK0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00M4ZQDK0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000B9XYV2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCTQ65',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0047315Y7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGPQW1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BR3KL6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S682Z6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JPRDQH1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VPGNR2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0016T3GQ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F31Z34',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H3GDJ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00MMDJG84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FXYF54',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BY33P5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002V098F7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CQB185',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BT0093',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0063FKTD9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCMBG4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C23KJ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BG8M31',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DY28W5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FTLBV7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ5SS8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BC2R71',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NQKP71',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00BDQ1H13',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C060M4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00BVR0D02',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HCVWW4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QJW156',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S681W1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZNRRJM2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000TJM7F0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS1949E2046',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00BTK1DT8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GBNZ4M0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C3J3C9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'RU000A106T36',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKCFC2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005CM7J89',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00MJH9LC4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004NLQHL0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FVXD63',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPZVW9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000K82ZT8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00K7T3037',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007HTCQT0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RG4ZQ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCWWV0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GBVBK51',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00475KHX6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWCKB6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWPXQ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LWNRP3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R2JZG39',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJW241',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000J79P80',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DQTXY6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000J6XT05',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DCTP29',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NLC9Z6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01F6N6NM7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C6Z021',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DD3KP1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNJHS8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QKJSX05',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DKDWS5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQZMH4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00658F3P3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PH54R1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NJGX84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000JLC8L8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLDV98',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01GHDJBW6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PN9NB9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBGGQ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BL30Y9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FQH8C6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VH7TZ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01GZF9VY6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000WG2LQ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H001V3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000MHTV89',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001QZCPJ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BW7X97',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMLWX8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LN4B5N0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBBNC6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BF6756',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0028VY3J4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BL46Q4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000J1QLT0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKNX95',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCZBF1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFPK65',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HPSG933',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DZS2L9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVD6X4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C7TF41',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C1DHF5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PV27K3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSBBP1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZMFX1S5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TBG000PV2L86',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C3HSR0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A103X66',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001K7WBT8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C0LW92',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DS5588',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPYD87',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BD1HP2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000G8N9C6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BN3P07',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BS0ZF1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q4NZ54',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GCTWDJ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DCNK80',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006G412Q6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00475JZZ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005XVXML5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004SK5VL9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB0WG4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMW2Z0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMHYD1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A0HG6Z8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0112Z87D8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0019JZ882',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009H04M17',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F3CWW7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NLB2G3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GVP5JL4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001ZZPQJ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLMZK6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q1NMJ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002B9MYC1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001M6CZY1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D13GN8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BL8804',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001PKMK06',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BS7KS3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005CHLM96',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QS6NV8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZNW65W3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009NRSWJ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BW2QX0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C3TKY6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DMBXR2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C5QMB5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001XVDJ15',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BYZ0Q5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000MZL0Y6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0122M8031',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FW5ZL6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00L2DB535',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNY197',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002N3N2R4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LLW2MF2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BG5LL6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B6F2F09',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BG14P4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CBMH27',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CL9VN6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHLYS1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S684M6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BX3BL3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BM0597',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XRTSTR1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPD168',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01103B471',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DR5QP5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS158641070',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQ4GG2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BG4QM5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002B298N6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000MBDGM6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Q402TR2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002NLDLV8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCG930',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DD8WX1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007HWGYQ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q7GG57',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BX57K1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01GJ3NY88',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGVW60',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGD8W4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00P4R3079',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00MVWLLM2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DWG505',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDNV95',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BL79J3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000JYP7L8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DBD6F6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BND699',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HQ77DS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BK6MB5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBS2Y0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RP8V70',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMTX31',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNLPJ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CQCCK6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D2ZTS8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XMJRPQ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QFB4J6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C43744',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BW29L1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CDMJW6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PVRDL2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDDNH5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00WR0QPZ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00F9XX7H4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000KVB7C7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG010RJL3B5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S687G6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y1DFV91',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BN8ZK8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BXRPH1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01GG28WR3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GD4N44',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LMYX123',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000JSJ2F6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00CBYY6M1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFD605',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ5HK0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CRN8N8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRK7L6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BK34C7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005BLN209',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGXMG9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BR54L0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004KB3S72',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCZL41',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002030NC4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005H82GB2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KDYT8C4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000TJ6F42',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP8Z50',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBXVK5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003CVMLQ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JRH1P95',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRNGM2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000K3STR7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VC6RYV6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CG9XT7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F6H8W8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000K4ND22',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQV1S2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGW354',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005GBRSR6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DD3510',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHRBT4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KVTBY91',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000JCZJS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BS73J1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBHHP9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKQDQ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBVJZ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCNF74',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRVKH0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHLYP4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000G12J78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BN46R9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002PHSYX9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0074Q3NK6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F61RJ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HN7W02',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJNGN9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG017BXPZ85',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001J1BQ86',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005P7Q881',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS0207L1061',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMSRR9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PN1SJ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJP882',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005D1WCQ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NSCNT7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BX74M4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RP60KV0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68473',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C16952',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FJS1S8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG019Y0WP19',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNMHS4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q5ZRM7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDTCX4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007DLZ601',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0077VNXV6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHB3M6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0122LQVR9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQLM34',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C1HQ43',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007WDD4B5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BN5LG7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00475K2X9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000TJ8XZ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BM7HL0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BF8CB6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG017J18W74',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PZGB75',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CN0Y73',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C1XKF6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002Q7J5Z1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00BGJYS07',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QCN464',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DZB5D77',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BT9DW0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D1Y3P1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBCDZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HJS1F0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000N7KJX8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB88K4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPDDB6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00389GQ73',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00S1HJ3M8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002VZ68Y2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005Q3MQY4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CZTB66',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000B9Z0J8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FQXC75',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007DJM539',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00699M8Q7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KHY5S69',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PRQ0V9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQX2N3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00BLYKS03',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKJG33',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QVJVYB5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNBDC2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVMPN3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YB1ZD58',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RNBH63',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DTT624',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002BCQK67',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CVKZY0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00L9HLWV8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWNFZ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NDYB67',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000B9X8C0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ0932',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01JLDJ6X5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LWM0XR7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVKXQ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S681B4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000TY1CD1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB6KF5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RTHVK7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0065XPGX9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000SR0YS4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG015PB0HH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0105XBRH0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00829F4P8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDPB15',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCVJ77',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB5006',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWM5P3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGXZB5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNSZP1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004HXD0G8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DDY1RK9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS5677J1088',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001D8R5D0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C1FB75',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKH263',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HHLBF9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00X0VP8D9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VCZX9Z6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMX289',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BS1YV5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWP7D9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0026ZDHR0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BTHH16',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000MM5VL9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01138DGZ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006N7S6K9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001KHJM17',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S681M2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C4S3P3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001K003W2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YV1J622',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJSBJ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRNLL2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0087DLDQ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00CVQZQ96',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C136Z8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001Q7HP63',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009XW8PY2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006598YS8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP30Y0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG014630587',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001DCCGR8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PSNMN1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006L8G4H1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFQYY3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QTFDQ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000R5XCX9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000M44VW8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSS5C0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003LYCMB1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000MKLJD1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00W7F99V5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PV2M48',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006PWZX16',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BN53G7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BN5HF7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D9H9F1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWLMJ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BV59Y6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C45984',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZNLTFK3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00TJGL0F0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QF1Q17',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00WYHL732',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CWL0F5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVWLJ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007WX14X0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCWKD6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJPDZ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00W0KZD98',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RNXFN14',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QGYG84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0060CPLJ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG008NMBXN8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGX2S0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKR1D6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP0HX7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00H00J2N1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000WCFV84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D4LWF6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNHSP9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BV0VK7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VSYYVB8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YQ82275',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YPS1KY3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QX74T1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BH0106',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0035M2ZB7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP0929',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWSGF4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68696',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LD1QR26',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LBLBBJ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001732GF9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C2BXK4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGRB25',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQ4512',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001CGB489',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LV0836',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QDVR53',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001XVDW70',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QGWY50',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DPKKK0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP52R2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCWG90',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DBKR53',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000TYXCT9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CR20B1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00475KKY8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKGXQ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NS3P30',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GD1JMV4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00P9KDZK6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00F9YLST6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0063GCHH8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D7HF89',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001J1QN87',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00MRHG523',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBX657',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q2HM09',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000K5M1S8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMH2Q7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PKCBY53',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQLTW7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HS77T5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CGQ4F7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HZ3562',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002YFXL29',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003DNHV56',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VR8SDG8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VSF90M3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BC2KW8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GQSRR5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00D8JD9Z9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG019Q32XJ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCJ161',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BX72V8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JG0FFZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000W325F7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BXK6C5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BD0TF8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB4D72',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QPHD08',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKJ092',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000JWD753',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B6WF7T5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS009177281',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSXQV7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CQV2N4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0056JW5G6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BX7DH0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GZYVY1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BY1DP5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNX3R4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C17X76',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BX2YN2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006Q0HY77',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003CVJP50',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BXPZB7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGGXH3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DW76Y6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVZP59',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPGQ60',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0100R9963',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00FYCQ352',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000P5JQX6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000J2XL74',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LFJVD9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDD940',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GX77LW3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVV7G1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00SHY90J5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00L4CWQ45',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGYMH7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006MDLY05',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000T8ZF80',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0063N8V69',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCT197',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HMSHL83',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNMMJ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHWDF9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFV758',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQ87N0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YYT9BD6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS609805522',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001BP92V1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q3JN03',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGBTC2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CF5097',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLSL58',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HTN2CQ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NW2S18',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LDPZMS6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPDXF8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C3GN47',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG008LJ4TF3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001MC8YF7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0077VS2C0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HCJMF9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BL16Q7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NLCCM3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DMFQS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0073F9RT7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HVQF9K2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQ5DS5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00212PVZ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMY992',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZGF6SS3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BXMFC3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHX7N2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CN3S73',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C0BZD1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00V1KSN04',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BH5LT6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000B9ZV28',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHCYJ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG014KFRNP7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q16VR4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LBLCD02',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007Z9V591',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00299NPM1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJL3N0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00VDHLSQ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QXWHD1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PTX047',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00P1919G5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BZ9223',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGJRC8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HF28Q9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DN7P92',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001LWHLJ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NNG2ZJ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB9Q78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004731489',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BN1M88',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFLXV3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB2DM7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0060K22C1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C43RR5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000R7Z112',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q0JJQ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003D4V951',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C5Z1S3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0147BN6G2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BD8PN9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C42WS4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H1RYG7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BD2NY8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000N2HDY5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0056655S1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QT15P7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H9LNX1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQWPC5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004730JJ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00LNJRQ09',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XS0FV56',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS0223R1088',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKRSZ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000N7KBZ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HW5GX3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H8TVT2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C0RGY3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCTLF6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DVPPK1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000TVRB50',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PSKYX7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C1FQS9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BH2JM1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDJL83',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004MN1R41',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C3KB84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002832GV8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSFRF3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00WBPG4C2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LLRNX3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FFDM15',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00GSNPM07',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBK401',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BK5S78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HGNYG8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001DCTG63',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0067QVJ50',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQ4WF8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FQ7YR4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A0JR514',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C2PL98',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HMJ9H54',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DW4LB1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BH3JF8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFVZ83',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BT7ZK6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RTDY25',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BS9HN3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQY289',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009PHHPL8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001DMCGS5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CL1FG7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RD3CL8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDLCQ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNC3Y9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB6M98',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C3N3B5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S686W0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWPP85',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FKTHQ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRMJN6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VJMH65',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWHD54',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FSMWC3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP02D2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000M1R011',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0195DR728',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y61SZL5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005MX5GZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HY28K89',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006GNSZW5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00P17H053',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001Z0Q6T5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMKDM3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCWCG1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB61F7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C30L48',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BF6LY3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQTMJ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKL348',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004Z2RGW8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C2D1C1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001B12Z39',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QY3XZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CDY3H5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JHNKJY8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BR2040',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHTPZ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFT2L4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S687W8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002ZCK2V9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGCQT9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68614',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB07P9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FX3Y66',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0120WC125',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB72K8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C1DC75',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHY4D9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0020BCPX5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DSZTN6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006FCB019',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003LFWP05',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BV8DN6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HGTH33',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVWZF9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PLF6N0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000R0L5J4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00W7FG4V8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000G7CDN9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003NJHZT9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000V4V0W6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C6XDL4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00564Y443',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000R607Y3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BL9C59',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCQ6J8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CS7CT9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NPWH832',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSHH72',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RVD346',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D0SMY8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0026ZG4W0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003338H34',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RJ2J04',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Z6RF483',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000T9PJD5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y91R9T3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000J0D904',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004731032',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCXNS3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C13CD9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRRG02',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D9D830',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CFZ003',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSQLT9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001YV1SM4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002B04MT8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00P19DKZ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001NDW1Z7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B3T3HD3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBD070',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQC9V2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107J11',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGRY34',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BV6R84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BX4MS1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00BLVZ228',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0077SYZV6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000S9XXB8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001KY3845',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DKMJ86',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RK52V1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C90DH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DZK6N6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D42FJ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00PZ78ZM0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PQ4W72',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A0JVJQ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVXPZ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009Q036D0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PV3J62',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FV28W9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP83H8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00G4Y2DC1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDTT76',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A0ZZFS9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVPG41',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HXSHDQ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VC0FC1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DQD26W3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BC33T9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000R8ZVD1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GRK2Z7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Z5JLLB3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BTNGZ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDZJK6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKKQ84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JH9TZ56',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q1KFH4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001KY4N87',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002YSC5M7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB2KN0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011LRHTM7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFRF55',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00P78Y7N1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS009084453',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DL8NMV2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ91B1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009LM28K6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005DWN8K8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000M65M61',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003981NS4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Q011TW9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00C6H6D40',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB9KF2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PXGT62',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002583CV8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000N7MZ06',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PJKKM9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00WCNDCZ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DW3SZS1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q9FZL4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG008NXC572',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVXC87',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP6LJ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QCW561',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKF014',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000TCD088',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VFX6Y4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCLYL9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01FND0CC1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005YHY0Q7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS009046502',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RP5HYS8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000K3BC83',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001MFW6D6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKVJK4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KXC8646',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CGJMB9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0134WCM78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJFJ98',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00H433CR2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCY878',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000K88H58',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCRMW7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBRPL4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMTFR4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FLPRH1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000G7QX50',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0078W3NQ3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002B9T6Y1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QLW222',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGSPS5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C2VBB0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0044K5DM4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QFPM65',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000G1C210',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00X2MYTC2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVDLH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00FN64XT9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVPV84',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRP9K8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BN2DC2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJDB15',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BG88X9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XK3WVD0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BF3G77',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFGNJ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PD6X77',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FD8023',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006D97VY9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HT5MG6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDXCJ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLR3Y7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVLRY8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00QN8K4M4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CZWZ05',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVMGF2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQDF10',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFC848',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009KG1750',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007KGRPY4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001K1CT23',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BP1152',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMT9T6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CXYSZ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B6WH9G3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PSJMV7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWVCP8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB6R33',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQ6CT5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCBYT2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68BR5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DBBGRX1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKLTM1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS0653A1079',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BC5WJ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FV1Z23',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB6G37',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y4RQNH4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003T1GM03',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002R1CW27',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QFH687',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00H2QQ8T5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C75N77',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004T7VS53',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ5GK2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000N625H8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HVKH3Q0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CVRFS4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FRVHB9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00333FYS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F9XKN7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006G2JVL2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000P1K2X6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0047315D0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009GSYN76',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0079T1PZ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C734W3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG018CYVVW5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001MM1RL0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S641N5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00225ZDD0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0113JGQF0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HDGRHH7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMGPW0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001M8HHB7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002ZYMKQ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D2ZK61',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0078ZLDG9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RJWGC4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PL3C78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XZZHVS4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000H3CDH4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0046L1KL9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFGXV9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JHNJW99',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNTW77',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q7GJ60',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YC53854',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0145FSNR1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RPJPN67',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CH5208',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BK5DP1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00M4RHBD0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG008N298Y8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002W2FT69',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0027F0Y27',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CHZ857',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBL8V7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00V6PS1F0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGZP70',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHCP19',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68BH6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BZ0DK8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BMWKC5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000TGLV00',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DD0489',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRCHB4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001J2PFF5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPRN29',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HG21Y3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000G9W6L0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0084BBZY6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BH1NH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01JLDH7S1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Q53VYM7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0014GJCT9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DGLTG5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB65D0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004731354',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C8H633',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C1S2X2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWJFZ4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006Q52QV2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BB5373',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRDSX5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1002V2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000P1B7C8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NY37X4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0098VVDT9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004S68FR6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01B9G42Y3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C5K5V6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNF508',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLCPY4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000N6X3L4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000TF4XZ9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCLBY5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004TC84Z8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000B9ZXB4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CS0D96',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A0ZZBC2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004JC5VD6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BT3HG5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CW9BM7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000KK1L04',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PRJCX9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000KLB4Q1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00M8832B5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BRWWH3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000B9XG87',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001WWJTK5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00286S4N9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HL7499',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Q741Z16',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DW4Q75',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWQTD0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000KK3464',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001J2R5H3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00JM7QBR6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VKG4R5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00MS90LK2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQNNP6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFRRX8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00FBJ6390',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000MXH9C1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BLF8D2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00K53L394',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000N9MNX3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ8YN7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011J3QM39',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BT1715',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BX3TD3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BKYDP9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001J19V24',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C4HKK2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C7P5M7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GJS7C1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QW7VC1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C4FQG6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDDN94',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHZ5J9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCGHH7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QDJT53',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00209SZJ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ3PD2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D5S4M0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBJQV0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0065B7K59',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RQKCR4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006HFPX77',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BNPYN9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0016MQ7C5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QKVV49',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BCQM58',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C1BCK2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CX0P89',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BR2B91',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BTGKK9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00HFX3N90',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F4F1N0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BM22F5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPBTL2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00XDH4NZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG008NVB1C0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00P33TCZ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BFS7D3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGGTW5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002B2J5X0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0160DYCH4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001QD41M9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0019V9M65',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00CWTTQ41',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QQCY41',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C2LZP3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00475K6C3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NK8H8T2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FFH4P5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0029ZX840',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PSXT64',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZHDJVK4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BS48J3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PT6BR8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DSS08K9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009S3NB30',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006Q52RD0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BQVTF5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000F0R4N9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZNSSKP3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KLHY7D7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PLNQN7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C01W49',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A102EM7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS007673065',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q1ZB87',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A102EQ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KJR2MY7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG013N16YX7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BF74Y0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HMNZV5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS5460G8805',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005H7MXN2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCSS0A103VG1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005HLSZ23',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS5460G8318',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS5460G7815',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PNJ9F5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PNJRH3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A100P44',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FS8GY0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004FPWG26',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDNJ29',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1071D5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00M8C8Y03',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS6137V3087',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KXH51H5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q5QG14',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS642881175',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS5459W1027',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BTR7Z0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A103VE6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q123R0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011C8J9N0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HT88C8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS4347X7993',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q6VJG4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D6RYS7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A103VM9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG013RTHWK8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CF9GL4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000M0P5L2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG016CSVY38',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A103VJ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBNQB7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BTDS98',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS4347R1721',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A102XX4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107563',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A101EJ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0025RWKW5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PWXXY5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C17LW4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000KMT5K3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005N1KZX4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C1L679',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A107597',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDTBL9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QBB2R0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HX9TN0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0015VYNT4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1022Z1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004FPTZB8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01236BLK6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS0BMDKNM37',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R980XY3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C16Z27',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001F8JPC4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHVSG6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HSHTP0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000G6GXC5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DZG23W3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000MQSW88',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG007WGM3G5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CG9VP5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PS0FX0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000FTQMS2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS0214Q7088',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000RFQZZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000000000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000R2T3H9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1071G8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000000002',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QBBFT9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG006GYFHV6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00R9805F5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NRFC2X2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001LRJJH4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005HLTYH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ29X7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'RU000A0ZZMD7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0025X2FJ1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'RU000A0ZZML0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A103VN7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Q5FMYM0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BGQ921',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DPPFX2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG333333333',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0018555F4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00M0P2RX7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00RPRPX12',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q8R7Y1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG004TRTWV4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000TZCSF9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCSS0A103VH9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009T0QJX2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00D7BDH61',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG013T81ZQ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003H6TM38',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DDXQR3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1039N1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HX76S7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00ZXX3KF9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A102EK1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q8RVM1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NXDKM8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NDCRW7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A106G80',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BW05W9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000P9FRH8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PRZSP5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS1369Y4070',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001P2KBP1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BV7ZQ5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000DY97J5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CF7ZN2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011Q55QS3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PG8230',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000C183Y1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJSXB0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BDJRC5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG01526SWY3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002TXJ9Q3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A103VK3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000MQVF45',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PTJPX6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'RU000A105RJ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000P5G869',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG014M8NBM4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BBV9N3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJX6S5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG008HBH279',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1071E3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002VZY764',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS642877397',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000T1G7X6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BHNNF7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00YRW4B42',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BXXRG1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS5459W8477',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ10N8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003H6TR19',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000L77B26',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00Y6D0N45',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000V1FPR1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PB3SM8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002DMN3L7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS5460G1958',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CPLR52',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CGFWK1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BK6997',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HT8SM3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CRF6Q8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B0SKXX2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0038VN4N7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS012VJJFG7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00DSB42G0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJKYW3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS642882249',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWC7P0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PWYVH7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS4347R2067',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0036B09Y5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00NJ6XQ74',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00V7649K4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QFMV31',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HTCFY3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CS4KW0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HX5MQ6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BK4VM5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BK42M9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG002GKR8T5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0195YJDZ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104KU3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000GLBJK9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B6WD888',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00X94LLL6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00D30D431',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A103VL1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QG1LV3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000KMKPY3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HR9779',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BXV152',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0027F1TD5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG009QVS7Y0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000JLH1H3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS4347X8231',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ2RF7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00FFPFT13',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A0ZZMN6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000CGC9C4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00V9V16J8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00D7BBRR8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005DXDPK9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS3734X8469',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG0073DLHS1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BK2V65',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000NXKWH0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000LNZ4P1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000KN18M3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG011C7ZVQ2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BVZ4F5',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ7G75',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00KJR2WB0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q1MZ15',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000TH7DF8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BSWKH7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HWV1X7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A101X68',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QN2BW8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000KWYDJ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q0CS41',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS5460E2404',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HSZ812',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BK3L48',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS642852044',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QRNHZ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003CPJ1W6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000Q8SV13',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BJ1XP4',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A1071F0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS330518794',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000JP3063',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003HC3CQ0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00B597128',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00MF4JRQ8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000HTG205',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS4347Y7638',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VD5B51',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS30A105M34',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BWCNN7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000PWZHX9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BPNZB6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A101X50',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS4347X8496',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS5459Y6941',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QVFB47',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS00A104172',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BK58Q1',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00L5F9F38',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000000001',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000JLLL93',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00C868SC8',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000JWXHK2',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00H2QL687',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000BT12H9',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG005VKB7D7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000QVL5M3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS30A104UC0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000TH6VB3',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG003GMGSH0',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000L74NQ7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000D02J82',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS4347B1109',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG001LRJC70',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG000VC1C55',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS10A1039P6',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00M0C8YM7',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'BBG00WYF7G78',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'TCS0BNYK7X86',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGAZR06250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNOTK06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSI0325000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSI0624000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCNI092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSGZH06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGAZR06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSIBN06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTHOME09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNASD03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMGNT09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTTATN09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSILV03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSILV09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWHEA03240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAMD032500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCHMF09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPLZL06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSBRF12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMMI062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTEU1224000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRTS092500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMOEX09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTIRAO09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNG0724000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAMD092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMXI032600',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPOSI06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCNY062500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSILV12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTTRNF06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTUSDRUBF00',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWHEAT1024',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGAZR09250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSOFL09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMTLR06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSMLT09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBR0724000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSNGR06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMXI122400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNG0624000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCBOM12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSPYF09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCNI062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGOLD12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTEU0325000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTEU0624000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMIX062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTKZT032500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTKMAZ12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRTS092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBYN062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTROSN06250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTASTR09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBR0424000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAFLT06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTVTBR06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSI0625000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNLMK12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTINR062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAUDU09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTLKOH03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTED0924000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTFEES06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPOSI09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMMI092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSUGAR0924',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTED0624000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAFLT12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMXI092500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTKZT122400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMXI092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRTS032600',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTFNI092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRTS062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTLKOH09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTKMAZ06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMOEX06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNIKK06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSVCB09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTHKD062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTTRNF09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMVID12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNL0424000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTDAX122400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSUGR07240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWHEAT0824',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTKMAZ03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRGBI09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTTRY032500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBR0924000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCBOM03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTOGI062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSI1225000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGLDRUBF00',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNASD09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBANE03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMXI062700',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTTCSI06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBELU12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBR1124000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRTS122400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTHANG09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNLMK06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTIMOEXF000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTVKCO09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTHOME12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMTSI09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWHEAT0524',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTVKCO03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGOLD03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTTCSI09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMAGN09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAMD062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMXI062500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCBOM09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTTRY122400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSBPR06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNIKK12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTROSN09250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMIX092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTALRS12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMVID03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBELU09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBR1024000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCO0524000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSI1224000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSBRF06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCO0624000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNASD12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSTOX06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAFKS06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTINR122400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAUDU06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTDAX092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBR0125000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPOLY09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGAZR12250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGAZR03260',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTEURRUBF00',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSNGP09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTALRS06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTYNDF06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTHOME06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTUCHF09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCO0424000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGL0924000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRUAL09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCNY092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGAZR12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTVKCO12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMGNT06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTKZT092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSNGR09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWUSH03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBELU06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSOFL06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRTSM09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMIX032500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMXI092600',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSI0326000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTUCNY12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTUCNY03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTEU0625000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCNY122400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWHEAT1224',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRGBI06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGBPU09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNIKK09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWHEAT0225',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTFLOT09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTUJPY06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMTSI12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSTOX09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSMLT06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSILV06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSPYF12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBSPB12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRUAL06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAED032500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTEU0925000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWUSH09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWHEAT0924',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPLT092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTFLOT06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBELU03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSI0925000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTISKJ09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPOLY06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRVI042400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRTS122500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGOLD06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTUJPY09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSTOX12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAFLT09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRTSM03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTUCNY09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNLMK09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMXI062600',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTHYDR06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTROSN12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTALRS09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTTRY062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTTATN12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTOZON06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTUCNY06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGL1224000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTUCAD06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSBPR09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBR1224000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTFIVE06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBR0824000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSBRF03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTROSN12250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTFLOT12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTVKCO06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWHEAT0724',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGAZR09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGBPU06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBANE06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTTRY092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSGZH12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMVID09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPLZL09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTTATN06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMXI122600',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNL0624000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBANE09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWUSH12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSUGR05240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWHEA06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGL0325000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAMD122400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSBRF09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRTS062500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTHANG06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBSPB09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBANE12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMAGN06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNG0424000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPHOR09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMXI122500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTASTR06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSIBN09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTED1224000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMXI032700',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNG0524000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCBOM06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGOLD09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGL0624000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBSPB06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMTSI06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTHANG03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTVTBR09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWHEAT0125',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTOGI092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSI0924000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPLD062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTEU0924000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMTLR09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCNY032500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRTS032500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWHEAT1124',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNG0924000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCNYRUBF00',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTHKD032500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAED122400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTINR092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSUGAR0424',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPLT122400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTHKD092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPIKK09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSNGP06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBR0524000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCNY092500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTKZT062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNG0324000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRTSM06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMVID06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTINR032500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWHEAT0325',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSGZH09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRTSM12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTDAX032500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMGNT12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGAZR06260',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPLD092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWUSH06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTWHEAT0424',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNG0824000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTUKZT06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTROSN09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRTKM06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCHMF06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTROSN06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPLD122400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRTKM09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSTOX03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTLKOH06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMIX122400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTUCHF06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTHANG12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSUGAR0724',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNL0524000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMXI062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTFNI062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTUCAD09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSGZH03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTDAX062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMXI122700',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTROSN03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSUGAR0824',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSUGAR0524',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBR0225000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSPYF03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTFEES09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPLT062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGAZR03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTROSN06260',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNASD06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBSPB03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTROSN03260',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTHKD122400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTIRAO06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTHYDR09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTRVI052400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTBR0624000',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTMXI032500',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTSPYF06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTKMAZ09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTCNY062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNOTK09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTNIKK03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAED062400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAFKS09240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTGMKN06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTISKJ06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTLKOH12240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTAED092400',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPIKK06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTPHOR06240',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
    {
      figi: 'FUTFLOT03250',
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
    },
  ]
}
