import { Context, Telegraf } from 'telegraf'

import { addAlert } from '../../helpers/addAlert'
import { commandWrapper } from '../../helpers/commandWrapper'
import { i18n } from '../../helpers/i18n'
import { log } from '../../helpers/log'
import { getAlertsCountForUser, removePriceAlert } from '../../models'
import { addAlert as addAlert2 } from './utils/addAlert'

export function setupAlert (bot: Telegraf<Context>) {
  const callback = commandWrapper(async ctx => {
    const { text } = ctx.message
    const { id: user } = ctx.from

    const alertsLimit = ctx.userLimits.priceLevels

    try {
      if (await getAlertsCountForUser(user) >= alertsLimit) {
        ctx.replyWithHTML(ctx.i18n.t('alerts_overlimit', { limit: alertsLimit }))
        return;
      }
    } catch (e) {
      ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
      log.error(e)
    }

    // Сценарий добавления
    let data = text.match(/^\/(alert|add)$/)

    if (data) {
      try {
        addAlert2(ctx, {
          // instrumentsList: [
          //   {
          //     id: 'binancecoin',
          //     source: EMarketDataSources.coingecko,
          //     name: 'Binance Coin',
          //     ticker: 'BNB',
          //     type: EMarketInstrumentTypes.Crypto,
          //     currency: 'USD',
          //     sourceSpecificData: {
          //       id: 'binancecoin'
          //     }
          //   },
          //   {
          //     id: 'oec-binance-coin',
          //     source: EMarketDataSources.coingecko,
          //     name: 'OEC Binance Coin',
          //     ticker: 'BNB',
          //     type: EMarketInstrumentTypes.Crypto,
          //     currency: 'USD',
          //     sourceSpecificData: {
          //       id: 'oec-binance-coin'
          //     }
          //   }
          // ]
        })

        // FIXME: catch можно сделать общий для всех шаблонов
      } catch (e) {
        ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
        log.error(e)
      }

      return
    }

    // Удаление алертов по инструменту
    data = text.match(/^\/alert remove ([a-zA-Zа-яА-ЯёЁ0-9]+)$/)

    if (data) {
      const symbol = data[1]

      try {
        await removePriceAlertAndSendMessage({ symbol, user, ctx })
      } catch (e) {
        log.error(e)
      }

      return
    }

    data = text.match(/^\/(alert|add) ([a-zA-Zа-яА-ЯёЁ0-9]+) ([\d.\s\-+%]+)$/)

    // Command to add alert
    if (data) {
      try {
        await addAlert({
          data: { symbol: data[2], price: data[3] },
          ctx
        })
      } catch (e) {
        log.error(e)
      }

      return
    }

    // Invalid Format
    ctx.replyWithHTML(ctx.i18n.t('alertErrorInvalidFormat'))
  });

  bot.command(['alert', 'add'], callback)
  bot.hears(i18n.t('ru', 'alert_button'), callback)

  function removePriceAlertAndSendMessage ({ user, symbol, ctx }) {
    return new Promise(async (rs, rj) => {
      try {
        const deletedCount = await removePriceAlert({ symbol, user })

        if (deletedCount) {
          ctx.replyWithHTML(ctx.i18n.t('alertRemovedBySymbol', { symbol: symbol.toUpperCase() }))
        } else {
          ctx.replyWithHTML(ctx.i18n.t('alertRemovedBySymbolNothingDeleted', { symbol: symbol.toUpperCase() }))
        }

        log.info('Удалены алерты для', symbol, user)

        rs()
      } catch (e) {
        await ctx.replyWithHTML(ctx.i18n.t('alertRemoveError'))
        rj(e)
      }
    })
  }
}
