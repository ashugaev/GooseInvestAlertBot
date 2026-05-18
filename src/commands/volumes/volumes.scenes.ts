import { Context } from 'telegraf'

import { SHIFT_TIMEFRAMES_ARRAY } from '@/commands/shift'
import { getTimeframesKeyboard } from '@/commands/shift/shift.keyboards'
import {
  VOLUME_ACTIONS,
  VOLUME_SCENES,
  VOLUME_SOURCES_CONFIG,
} from '@/commands/volumes/volumes.constants'
import { i18n } from '@/helpers/i18n'
import { chooseSourceKeyboard } from '@/keyboards/chooseSource'
import { premiumDetailsButton } from '@/keyboards/premiumDetailsButton'
import { EMarketDataSources } from '@/marketApi/types'
import { VolumeAlertModel } from '@/models/VolumeAlert'
import { immediateStep, waitMessageStep } from '@/scenes'
import { waitButtonClickStep } from '@/scenes/wrappers'
const WizardScene = require('telegraf/scenes/wizard')
const { set } = require('lodash')

/**
 * FIXME: Add a rate limit on the number of alerts per time unit
 */
export const volumeScenes = new WizardScene(
  VOLUME_SCENES.add,
  /**
   * Initial
   */
  immediateStep('volumes_add_start-scene', async (ctx: Context) => {
    const currentAlertsCount = await VolumeAlertModel.find({
      user: ctx.from.id,
    }).count()

    // TODO: Test this
    const limit = ctx.limits.volumes

    // Limit-overflow check
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

    const availableSourses = Object.keys(VOLUME_SOURCES_CONFIG).filter(
      (key) => VOLUME_SOURCES_CONFIG[key].enabled
    ) as EMarketDataSources[]

    // Ask for the exchange
    await ctx.replyWithHTML(i18n.t('ru', 'volume_add_askSource'), {
      reply_markup: {
        ...chooseSourceKeyboard(VOLUME_ACTIONS.chooseSource, availableSourses),
      },
    })

    // @ts-ignore
    return ctx.wizard.next()
  }),
  /**
   * Choose source
   *
   * Handle: Result of the exchange selection
   * Ask: Timeframe
   */
  waitButtonClickStep(
    VOLUME_ACTIONS.chooseSource,
    'volume_add_choose-source',
    async (ctx, actionsPayload, state) => {
      // Save the exchange in state
      set(state, 'shift.source', actionsPayload.source)

      // Ask for the timeframe
      await ctx.replyWithHTML(i18n.t('ru', 'volume_add_chooseTimeframe'), {
        reply_markup: getTimeframesKeyboard(
          // FIXME: Remove hardcoded 5 minutes
          SHIFT_TIMEFRAMES_ARRAY.filter((el) => el.lifetime >= 1000 * 60 * 5) // >= 5 minutes
        ),
      })

      return ctx.wizard.next()
    }
  ),
  /**
   * Get: Timeframe
   * Ask: Candles Count
   */
  waitMessageStep('volume_add_choose-timeframe', async (ctx, state) => {
    // Save the timeframe in state
    set(state, 'shift.timeframe', ctx.message.text)

    // Ask for the number of candles
    await ctx.replyWithHTML(i18n.t('ru', 'volume_candles_number'))

    return ctx.wizard.next()
  }),
  /**
   * Get:  Candles Count
   * Ask: Formula
   */
  waitMessageStep('volume_add_ask-candles-count', async (ctx, state) => {
    // Save the candle count in state
    set(state, 'shift.candlesCount', ctx.message.text)

    // Ask for the formula
    await ctx.replyWithHTML(i18n.t('ru', 'volume_formula'))

    return ctx.wizard.next()
  }),
  /**
   * Get:  Formula
   * Ask: Tickers
   */
  waitMessageStep('volume_add_ask-formula', async (ctx, state) => {
    // Save the formula in state
    set(state, 'shift.formula', ctx.message.text)

    // Ask for the tickers
    await ctx.replyWithHTML(i18n.t('ru', 'volume_add_chooseTickers'))

    return ctx.wizard.next()
  }),
  /**
   * Get:  Tickers
   * Ask: -
   */
  waitMessageStep('volume_add_ask-tickers', async (ctx, state) => {
    // Save the tickers in state
    set(state, 'shift.tickers', ctx.message.text)

    // Ask for the number of candles
    await ctx.replyWithHTML(i18n.t('ru', 'volume_add_success'))

    return ctx.wizard.next()
  })
)
