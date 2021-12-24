import { Context as TelegrafContext } from 'telegraf';

import { Scenes } from '../constants';
import { addPriceAlert, AddPriceAlertParams, EMarketInstrumentTypes } from '../models';
import { getInstrumentDataWithPrice } from './getInstrumentData';
import { getPricesFromString } from './getPricesFromString';
import { i18n } from './i18n';
import { log } from './log';
import { symbolOrCurrency } from './symbolOrCurrency';

interface AddAlertParams {
  data: {
    symbol: string
    price: string
  }
  ctx: TelegrafContext
  startedFromScene?: boolean
}

export const addAlert = ({
  data,
  ctx,
  startedFromScene
}: AddAlertParams) => new Promise<{ _id: string, addedCount: number }>(async (rs, rj) => {
  try {
    const { price: targetPrice } = data
    let { symbol } = data

    const { id: user } = ctx.from

    let instrumentData
    let lastPrice

    try {
      if (!symbol) {
        throw new Error('Не пришел символ при установке алерта')
      }

      const result = (await getInstrumentDataWithPrice({ symbol, ctx }))[0]

      instrumentData = result.instrumentData
      lastPrice = result.price

      // Перепишем на случай если юзер писал пару с валютой
      symbol = instrumentData.ticker
    } catch (e) {
      log.error('ошибка создания алерта', e)

      ctx.replyWithHTML(i18n.t('ru', 'alertAddError'))

      rj(e)
      return;
    }

    const { prices, invalidValues } = getPricesFromString({
      string: targetPrice,
      lastPrice
    })

    const priceAlerts = []
    let _id = null

    for (let i = 0, l = prices.length; l > i; i++) {
      const price = prices[i]

      try {
        const params: AddPriceAlertParams = {
          user,
          symbol,
          name: instrumentData.name,
          currency: instrumentData.sourceSpecificData.currency,
          type: instrumentData.type,
          source: instrumentData.source,
          initialPrice: lastPrice
        }

        lastPrice < price
          ? (params.greaterThen = price)
          : (params.lowerThen = price)

        // Если крипта - добавим валюту в пару
        if (instrumentData.type == EMarketInstrumentTypes.Crypto) {
          params.symbol = params.symbol + instrumentData.sourceSpecificData.currency.toUpperCase()
        }

        const createdItem = await addPriceAlert(params)

        // Для добавления коммента
        _id = createdItem._id

        priceAlerts.push(price)
      } catch (e) {
        await ctx.replyWithHTML(i18n.t('ru', 'alertAddError'))
        log.error(e)

        continue;
      }
    }

    if (!priceAlerts.length) {
      ctx.replyWithHTML(i18n.t('ru', 'alertAddError'))
      rj('Не добавлено ни одного оповещения')
      return;
    }

    const { name } = instrumentData
    const { currency } = instrumentData.sourceSpecificData

    const i18nParams = {
      price: priceAlerts.map(el => `${el}${symbolOrCurrency(currency)}`).join(', '),
      symbol,
      name,
      invalid: null
    }

    if (invalidValues.length) {
      i18nParams.invalid = invalidValues.join(', ')
    }

    await ctx.replyWithHTML(
      priceAlerts.length === 1
        ? i18n.t('ru', 'alertCreated', i18nParams)
        : i18n.t('ru', 'alertCreatedMany', i18nParams)
    )

    // Если только одна цена
    if (prices.length === 1 && !startedFromScene) {
      // @ts-expect-errors TODO: Разобраться
      await ctx.scene.enter(Scenes.alertMessage, { _id })
    }

    rs({ _id, addedCount: priceAlerts.length })
  } catch (e) {
    rj(e)
  }
})
