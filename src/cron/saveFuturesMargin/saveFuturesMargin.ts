import { log } from '@helpers'
import { EMarketInstrumentTypes, InstrumentsListModel } from '@models'

import { tinkoffApi } from '../../app'
import { wait } from '../../helpers/wait'
import { EMarketDataSources } from '../../marketApi/types'
import { TinkoffFuturesMarginModel } from '../../models/TinkoffFuturesMargin'

export const saveFuturesMargin = async () => {
  const features = await InstrumentsListModel.find({
    type: EMarketInstrumentTypes.Future,
    source: EMarketDataSources.tinkoff
  }).lean()

  const dataForBulkUpdate = []

  for (let i = 0; i < features.length; i++) {
    try {
      const feature = features[i]
      // @ts-expect-error
      const { id, sourceSpecificData: { figi } } = feature

      const futureMargin = await tinkoffApi.instruments.getFuturesMargin({ figi })

      dataForBulkUpdate.push({
        upsert: true,
        filter: { tickerId: id },
        update: {
          tickerId: id,
          minPriceIncrement: futureMargin.minPriceIncrement,
          minPriceIncrementAmount: futureMargin.minPriceIncrementAmount
        }
      })

      await wait(1000)
    } catch (e) {
      log.error('Failed to collect futures margin data', e)
      await wait(5000)
    }
  }

  await TinkoffFuturesMarginModel.bulkWrite(dataForBulkUpdate)

  log.info('Futures margin data saved', dataForBulkUpdate.length)
}
