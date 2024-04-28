import { Context, Telegraf } from 'telegraf'

import { repeatAlertVariants } from '@/commands/alert/actions/repeat'
import { repeatWithDifferentPrice } from '@/commands/alert/actions/repeatWithDifferentPrice'
import { repeatWithSamePrice } from '@/commands/alert/actions/repeatWithSamePrice'
import { ALERT_ACTIONS } from '@/commands/alert/alert.constants'
import { triggerActionRegexp } from '@/helpers/triggerActionRegexp'
import { premiumDetailsButton } from '@/keyboards/premiumDetailsButton'

import { addAlert } from '../../helpers/addAlert'
import { commandWrapper } from '../../helpers/commandWrapper'
import { i18n } from '../../helpers/i18n'
import { log } from '../../helpers/log'
import { PriceAlertModel, removePriceAlert } from '../../models'
import { addAlertScenario } from './scenarios/addAlertScenario'

const logPrefix = '[ALERT COMMAND]'

export function setupAlert(bot: Telegraf<Context>) {
  const callback = commandWrapper({ availableForAdmins: true }, async (ctx) => {
    const { text } = ctx.message
    const { id: user } = ctx.from

    if (!user) {
      throw new Error('User not found')
    }

    const alertsLimit = ctx.limits.priceLevels
    const userAlertsCount = await PriceAlertModel.find({ user }).count()

    if (userAlertsCount >= alertsLimit) {
      await ctx.replyWithHTML(
        ctx.i18n.t('alerts_overlimit', { limit: alertsLimit }),
        {
          reply_markup: {
            inline_keyboard: [[premiumDetailsButton]],
          },
        }
      )
      return
    }

    // Сценарий добавления
    let data = text.match(/^\/(alert|add|a)$/)

    if (data) {
      addAlertScenario(ctx, {})
      return
    }

    // Добавление одной командой
    data = text.match(
      /^\/(alert|add|a) ([a-zA-Zа-яА-ЯёЁ0-9_]+) ([\d.\s\-+%]+)$/
    )

    log.info(logPrefix, 'data', data)

    if (data) {
      log.info(logPrefix, 'One command alert adding')

      // FIXME: Используется deprecated ф-ция, нужно поддержать для этого кейса addAlertScenario
      await addAlert({
        ctx,
        data: {
          symbol: data[2],
          price: data[3],
        },
      })

      return
    }

    // Добавление неполной командой
    data = text.match(/^\/(alert|add|a) ([a-zA-Zа-яА-ЯёЁ0-9_]+)$/)

    if (data) {
      addAlertScenario(ctx, {
        ticker: data[2].toUpperCase(),
      })

      return
    }

    // Удаление алертов по инструменту
    data = text.match(/^\/alert remove ([a-zA-Zа-яА-ЯёЁ0-9_]+)$/)

    if (data) {
      const symbol = data[1].toUpperCase()

      try {
        await removePriceAlertAndSendMessage({
          symbol,
          user,
          ctx,
          chat: ctx.adminChatActive?.id ?? null,
        })
      } catch (e) {
        await ctx.replyWithHTML(ctx.i18n.t('alertRemoveError'))
      }

      return
    }

    // Invalid Format
    ctx.replyWithHTML(ctx.i18n.t('alertErrorInvalidFormat'))
  })

  bot.command(['alert', 'add', 'a'], callback)
  bot.hears(i18n.t('ru', 'alert_button'), callback)

  bot.action(triggerActionRegexp(ALERT_ACTIONS.repeat), repeatAlertVariants)
  bot.action(
    triggerActionRegexp(ALERT_ACTIONS.repeatSamePrice),
    repeatWithSamePrice
  )
  bot.action(
    triggerActionRegexp(ALERT_ACTIONS.repeatDifferentPrice),
    repeatWithDifferentPrice
  )

  async function removePriceAlertAndSendMessage({ user, symbol, ctx, chat }) {
    const deletedCount = await removePriceAlert({
      symbol,
      user,
      chat,
      triggered: true,
    })

    if (deletedCount) {
      ctx.replyWithHTML(
        ctx.i18n.t('alertRemovedBySymbol', { symbol: symbol.toUpperCase() })
      )
    } else {
      ctx.replyWithHTML(
        ctx.i18n.t('alertRemovedBySymbolNothingDeleted', {
          symbol: symbol.toUpperCase(),
        })
      )
    }

    log.info('Удалены алерты для', symbol, user)
  }
}
