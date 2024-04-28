import { Context } from 'telegraf'

import { VOLUME_SCENES } from '@/commands/volumes/volumes.constants'
import { i18n } from '@/helpers/i18n'
import { chooseSourceKeyboard } from '@/keyboards/chooseSource'
import { premiumDetailsButton } from '@/keyboards/premiumDetailsButton'
import { VolumeAlertModel } from '@/models/VolumeAlert'
import { immediateStep } from '@/scenes'
const WizardScene = require('telegraf/scenes/wizard')
const { set } = require('lodash')

/**
 * FIXME: Поставить лими на кол-во алертов за единицу времени
 */
export const volumeScenes = new WizardScene(
  VOLUME_SCENES.add,
  /**
   * Initial
   */
  immediateStep('shift_add_start-scene', async (ctx: Context) => {
    const currentAlertsCount = await VolumeAlertModel.find({
      user: ctx.from.id,
    }).count()

    // TODO: Test this
    const limit = ctx.limits.volumes

    // Проверка на выход за лимиты
    if (currentAlertsCount >= limit) {
      await ctx.replyWithHTML(
        i18n.t('ru', 'shift_add_overlimit', {
          limit,
        }),
        {
          reply_markup: {
            inline_keyboard: [[premiumDetailsButton]],
          },
        }
      )

      // @ts-ignore
      return ctx.scene.leave()
    }

    set(ctx, 'wizard.state.limit', limit)
    set(ctx, 'wizard.state.currentAlertsCount', currentAlertsCount)

    // Спрашиваем биржу
    await ctx.replyWithHTML(i18n.t('ru', 'shift_add_askSource'), {
      reply_markup: {
        ...chooseSourceKeyboard(),
      },
    })

    // @ts-ignore
    return ctx.wizard.next()
  })
  /**
   * Choose source
   */
  // source,
  // timeframe,
  // formula,
  // tickers,
  // alertsConfig
)
