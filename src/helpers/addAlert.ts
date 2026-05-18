import { Context as TelegrafContext } from 'telegraf'

import { getSourceMark } from '@/helpers/getSourceMark'

import { Scenes } from '../constants'
import { addPriceAlerts, PriceAlert } from '../models'
import { getInstrumentDataWithPrice } from './getInstrumentData'
import { getPricesFromString } from './getPricesFromString'
import { getSymbolByTicker } from './getSymbolByTicker'
import { i18n } from './i18n'
import { log } from './log'

const logPrefix = '[ADD ALERT]'

interface AddAlertParams {
  data: {
    symbol: string
    price: string
  }
  ctx: TelegrafContext
  startedFromScene?: boolean
}

export const addAlert = async ({
  data,
  ctx,
  startedFromScene,
}: AddAlertParams): Promise<{ _id: string; addedCount: number }> => {
  const { price: targetPrice } = data
  let { symbol } = data

  const { id: user } = ctx.from

  let instrumentData
  let lastPrice

  try {
    if (!symbol) {
      throw new Error('Missing symbol when setting an alert')
    }

    const result = (await getInstrumentDataWithPrice({ symbol }))[0]
    if (!result) {
      await ctx.replyWithHTML(
        i18n.t('ru', 'alertErrorUnexistedSymbol', { symbol }),
        { disable_web_page_preview: true }
      )
    }

    instrumentData = result.instrumentData
    lastPrice = result.price

    // Overwrite in case the user typed the pair with a currency suffix
    symbol = instrumentData.ticker
  } catch (e) {
    log.error('Failed to create alert', e)

    await ctx.replyWithHTML(i18n.t('ru', 'alertAddError'))

    return
  }

  const { prices, invalidValues } = getPricesFromString({
    string: targetPrice,
    lastPrice,
  })

  console.log(logPrefix, 'prices', prices)
  console.log(logPrefix, 'invalidValues', invalidValues)

  const priceAlerts = []
  let _id = null

  for (let i = 0, l = prices.length; l > i; i++) {
    const price = prices[i]

    try {
      const params: PriceAlert = {
        tickerId: instrumentData.id,
        user,
        symbol,
        name: instrumentData.name,
        currency: instrumentData.currency,
        type: instrumentData.type,
        source: instrumentData.source,
        initialPrice: lastPrice,
        botId: ctx.goose.id,
        chat: ctx.adminChatActive?.id ? Number(ctx.adminChatActive?.id) : null,
      }

      lastPrice < price
        ? (params.greaterThen = price)
        : (params.lowerThen = price)

      // For crypto, append the currency to the pair
      // if (instrumentData.type == EMarketInstrumentTypes.Crypto) {
      //   params.symbol = params.symbol + instrumentData.sourceSpecificData.currency.toUpperCase();
      // }

      const createdItem = await addPriceAlerts([params])

      // For attaching a comment afterwards
      _id = createdItem[0]._id

      priceAlerts.push(price)
    } catch (e) {
      await ctx.replyWithHTML(i18n.t('ru', 'alertAddError'))
      log.error(e)

      continue
    }
  }

  if (!priceAlerts.length) {
    await ctx.replyWithHTML(i18n.t('ru', 'alertAddError'))
    throw new Error('No alerts were added')
  }

  const { name } = instrumentData
  const { currency } = instrumentData

  const i18nParams = {
    price: priceAlerts
      .map((el: string) => `${el}${getSymbolByTicker(currency) ?? ''}`)
      .join(', '),
    symbol,
    name,
    invalid: null,
    onePrice: priceAlerts.length === 1,
    source: getSourceMark(instrumentData),
  }

  if (invalidValues.length) {
    i18nParams.invalid = invalidValues.join(', ')
  }

  await ctx.replyWithHTML(i18n.t('ru', 'alertCreated', i18nParams), {
    disable_web_page_preview: true,
  })

  // If only one price
  if (prices.length === 1 && !startedFromScene) {
    // @ts-expect-errors TODO: Investigate
    await ctx.scene.enter(Scenes.alertMessage, { _id })
  }

  return { _id, addedCount: priceAlerts.length }
}
