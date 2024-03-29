import { Context as TelegrafContext } from 'telegraf'

import { Scenes } from '../constants'
import { AddPriceAlertParams, addPriceAlerts } from '../models'
import { getInstrumentDataWithPrice } from './getInstrumentData'
import { getPricesFromString } from './getPricesFromString'
import { getSourceMark } from './getSourceMark'
import { i18n } from './i18n'
import { log } from './log'
import { symbolOrCurrency } from './symbolOrCurrency'

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
  startedFromScene
}: AddAlertParams): Promise<{ _id: string, addedCount: number }> => {
  const { price: targetPrice } = data
  let { symbol } = data

  const { id: user } = ctx.from

  let instrumentData
  let lastPrice

  try {
    if (!symbol) {
      throw new Error('Не пришел символ при установке алерта')
    }

    const result = (await getInstrumentDataWithPrice({ symbol }))[0]
    if (!result) {
      await ctx.replyWithHTML(
        i18n.t('ru', 'alertErrorUnexistedSymbol', { symbol }),
        { disable_web_page_preview: true }
      )
    };

    instrumentData = result.instrumentData
    lastPrice = result.price

    // Перепишем на случай если юзер писал пару с валютой
    symbol = instrumentData.ticker
  } catch (e) {
    log.error('ошибка создания алерта', e)

    await ctx.replyWithHTML(i18n.t('ru', 'alertAddError'))

    return
  }

  const { prices, invalidValues } = getPricesFromString({
    string: targetPrice,
    lastPrice
  })

  console.log(logPrefix, 'prices', prices)
  console.log(logPrefix, 'invalidValues', invalidValues)

  const priceAlerts = []
  let _id = null

  for (let i = 0, l = prices.length; l > i; i++) {
    const price = prices[i]

    try {
      const params: AddPriceAlertParams = {
        tickerId: instrumentData.id,
        user,
        symbol,
        name: instrumentData.name,
        currency: instrumentData.currency,
        type: instrumentData.type,
        source: instrumentData.source,
        initialPrice: lastPrice
      }

      lastPrice < price
        ? (params.greaterThen = price)
        : (params.lowerThen = price)

      // Если крипта - добавим валюту в пару
      // if (instrumentData.type == EMarketInstrumentTypes.Crypto) {
      //   params.symbol = params.symbol + instrumentData.sourceSpecificData.currency.toUpperCase();
      // }

      const createdItem = await addPriceAlerts([params])

      // Для добавления коммента
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
    throw new Error('Не добавлено ни одного оповещения')
  }

  const { name } = instrumentData
  const { currency } = instrumentData

  const i18nParams = {
    price: priceAlerts.map((el: string) => `${el}${symbolOrCurrency(currency) ?? ''}`).join(', '),
    symbol,
    name,
    invalid: null,
    onePrice: priceAlerts.length === 1,
    source: getSourceMark({ source: instrumentData.source, item: instrumentData })
  }

  if (invalidValues.length) {
    i18nParams.invalid = invalidValues.join(', ')
  }

  await ctx.replyWithHTML(i18n.t('ru', 'alertCreated', i18nParams), { disable_web_page_preview: true })

  // Если только одна цена
  if (prices.length === 1 && !startedFromScene) {
    // @ts-expect-errors TODO: Разобраться
    await ctx.scene.enter(Scenes.alertMessage, { _id })
  }

  return { _id, addedCount: priceAlerts.length }
}
