import { Context } from 'telegraf'

import { AskByModel } from '@/components/askByModel/askByModel'
import { SOURCE_CONFIG } from '@/constants/sourceConfig'
import { shiftsCache } from '@/cron/shiftsChecker'
import { chooseSourceKeyboard } from '@/keyboards/chooseSource'
import { premiumDetailsButton } from '@/keyboards/premiumDetailsButton'
import {
  immediateStep,
  waitButtonClickStep,
  waitMessageStep,
} from '@/scenes/wrappers'

import { i18n } from '../../helpers/i18n'
import {
  getInstrumentInfoByTicker,
  getTimeShiftsCount,
  TimeShift,
} from '../../models'
import { TimeShiftModel } from '../../models/TimeShifts'
import {
  SHIFT_ACTIONS,
  SHIFT_MAX_PERCENT,
  SHIFT_SCENES,
  SHIFT_TIMEFRAMES_ARRAY,
  SHIFT_TIMEFRAMES_BY_SOURCE_CONFIG,
} from './shift.constants'
import {
  getShiftConfigKeyboard,
  getTimeframesKeyboard,
} from './shift.keyboards'
import { IAdditionalShiftConfig } from './shift.types'

const WizardScene = require('telegraf/scenes/wizard')
const { set } = require('lodash')

// FIXME: Turned off now
export const updatePercent = new AskByModel<typeof TimeShift>(
  TimeShiftModel,
  {
    percent: () => ({
      type: 'number',
      question: i18n.t('ru', 'shift_add_choosePercent'),
    }),
  },
  {
    // sceneName: TRADE_SCENE,
    // askFields: ['kek'],
    // successMessage: () => ,
    onSuccess: async (ctx, state) => {
      await ctx.replyWithHTML(
        // @ts-ignore
        i18n.t('ru', 'shift_perchent_changed', { percent: state.percent })
      )
    },
  }
)

const askPercent = immediateStep(
  'shift_update_percent_ask-percent',
  async (ctx: Context) => {
    await ctx.replyWithHTML(i18n.t('ru', 'shift_add_choosePercent'))

    // @ts-ignore
    return ctx.wizard.next()
  }
)

const savePercent = waitMessageStep(
  'shift_update_percent_save-percent',
  async (ctx) => {
    const { text: percent } = ctx.message

    const intPercent = parseFloat(percent)

    // Invalid value
    if (!intPercent || percent > SHIFT_MAX_PERCENT) {
      await ctx.replyWithHTML(
        i18n.t('ru', 'shift_add_error_maxPercent', {
          maxPercent: SHIFT_MAX_PERCENT,
        })
      )

      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }

    const { _id } = ctx.wizard.state

    await TimeShiftModel.updateOne(
      {
        _id,
      },
      {
        $set: {
          percent: intPercent,
        },
      }
    )

    shiftsCache.update()

    await ctx.replyWithHTML(
      i18n.t('ru', 'shift_perchent_changed', { percent: intPercent })
    )

    // @ts-ignore
    return ctx.scene.leave()
  }
)

export const shiftSceneUpatePercent = new WizardScene(
  SHIFT_SCENES.updatePercent,
  askPercent,
  savePercent
)

/**
 * Handle: -
 * Ask: Exchange
 * */
const startShiftAddScene = immediateStep(
  'shift_add_start-scene',
  async (ctx: Context) => {
    // Already added by the user
    const userShiftsCount = await getTimeShiftsCount({
      user: ctx.from.id,
      chat: ctx.adminChatActive?.id,
      botId: ctx.goose.id,
    })

    // Limits for this user
    const shiftsLimitForUser = ctx.limits.shifts

    // Stash into state for the next steps
    set(ctx, 'wizard.state.shift.limit', shiftsLimitForUser)
    set(ctx, 'wizard.state.shift.userShiftsCount', userShiftsCount)

    // Limit-overflow check
    if (userShiftsCount >= shiftsLimitForUser) {
      await ctx.replyWithHTML(
        i18n.t('ru', 'shift_add_overlimit', {
          limit: shiftsLimitForUser,
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

    // Ask for the exchange
    await ctx.replyWithHTML(i18n.t('ru', 'shift_add_askSource'), {
      reply_markup: {
        ...chooseSourceKeyboard(SHIFT_ACTIONS.chooseSource),
      },
    })

    // @ts-ignore
    return ctx.wizard.next()
  }
)

/**
 * Handle: Result of the exchange selection
 * Ask: Tickers list
 */
const shiftAddHandleChooseSource = waitButtonClickStep(
  SHIFT_ACTIONS.chooseSource,
  'shift_add_choose-source',
  async (ctx, actionsPayload, state) => {
    // Save the exchange in state
    set(state, 'shift.source', actionsPayload.source)

    // Ask for the timeframe
    await ctx.replyWithHTML(i18n.t('ru', 'shift_add_chooseTimeframe'), {
      reply_markup: getTimeframesKeyboard(
        SHIFT_TIMEFRAMES_BY_SOURCE_CONFIG[actionsPayload.source]
      ),
    })

    return ctx.wizard.next()
  }
)

/**
 * Handle: Result of the timeframe selection
 * Ask: Tickers list
 */
const shiftHandleChooseTimeframes = waitButtonClickStep(
  SHIFT_ACTIONS.chooseTimeframe,
  'shift_add_choose-timeframe',
  async (ctx, actionPayload, state) => {
    const { timeframe } = actionPayload

    // Save the timeframe
    set(state, 'shift.timeframe', timeframe)

    // Ask for the tickers
    await ctx.replyWithHTML(i18n.t('ru', 'shift_add_chooseTickers'))

    return ctx.wizard.next()
  }
)

/**
 * Handle: Tickers list
 * Ask: Percent
 */
const shiftAddChooseTickers = waitMessageStep(
  'shift_add_choose-tickers',
  async (ctx) => {
    const { text: tickers } = ctx.message
    const {
      userShiftsCount,
      source,
      limit: shiftsLimitForUser,
    } = ctx.wizard.state.shift

    const tickersArr = tickers.trim().toUpperCase().split(' ')

    const tickersInfo = await getInstrumentInfoByTicker({
      ticker: [...tickersArr, ...tickersArr.map((t: string) => `${t}USDT`)],
      source,
    })

    // No such tickers in DB for the chosen exchange
    if (!tickersInfo.length) {
      await ctx.replyWithHTML(
        i18n.t('ru', 'shift_add_noTickers', {
          source: SOURCE_CONFIG[source].fullName,
        })
      )

      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }

    // User exceeds their limits
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    if (userShiftsCount + tickersInfo.length > shiftsLimitForUser) {
      await ctx.replyWithHTML(
        i18n.t('ru', 'shift_add_overlimit-less-tickers', {
          availableCount: shiftsLimitForUser - userShiftsCount,
          limit: shiftsLimitForUser,
        }),
        {
          reply_markup: {
            inline_keyboard: [[premiumDetailsButton]],
          },
        }
      )

      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }

    // Only some of the tickers were found on the exchange
    if (tickersInfo.length < tickersArr.length) {
      await ctx.replyWithHTML(
        i18n.t('ru', 'shift_add_wrongTicker', {
          tickers: tickersInfo.map((el) => el.ticker).join(' ,'),
          source: SOURCE_CONFIG[source].fullName,
        })
      )
    }

    set(
      ctx,
      'wizard.state.shift.tickers',
      tickersInfo.map((el) => el.ticker)
    )
    set(ctx, 'wizard.state.shift.tickersInfo', tickersInfo)
    set(ctx, 'wizard.state.shift.timeframes', SHIFT_TIMEFRAMES_ARRAY)

    // Ask for the change percent to track
    await ctx.replyWithHTML(i18n.t('ru', 'shift_add_choosePercent'))

    return ctx.wizard.next()
  }
)

/**
 * Handle: Percent
 * Ask: -
 */
const shiftAddChoosePercent = waitMessageStep(
  'shift_add_choose-percent',
  async (ctx) => {
    const { text: percent } = ctx.message

    const intPercent = parseFloat(percent)

    // Invalid value
    if (!intPercent || percent > SHIFT_MAX_PERCENT) {
      await ctx.replyWithHTML(
        i18n.t('ru', 'shift_add_error_maxPercent', {
          maxPercent: SHIFT_MAX_PERCENT,
        })
      )

      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }

    const { tickers, timeframe, timeframes, tickersInfo } =
      ctx.wizard.state.shift
    const { id: user } = ctx.from

    const tickersInfoObj = tickersInfo.reduce((acc, el) => {
      acc[el.ticker] = el

      return acc
    }, {})

    // Default additional shift settings applied after creation
    const additionalShiftConfig: IAdditionalShiftConfig = {
      muted: true,
      growAlerts: true,
      fallAlerts: true,
    }

    const newShifts: TimeShift[] = tickers.map((ticker) => ({
      percent: intPercent,
      tickerId: tickersInfoObj[ticker].id,
      timeframe,
      ticker,
      user,
      chat: ctx.adminChatActive?.id ?? null,
      name: tickersInfoObj[ticker].name,
      botId: ctx.goose.id,
      ...additionalShiftConfig,
    }))

    const dbShifts = await TimeShiftModel.insertMany(newShifts)
    shiftsCache.update()

    set(ctx, 'wizard.state.shift.percent', intPercent)
    set(
      ctx,
      'wizard.state.shift.newShiftsId',
      dbShifts.map((el) => el._id)
    )

    // Successful add
    await ctx.replyWithHTML(
      i18n.t('ru', 'shift_add_success', {
        time: timeframes.find((el) => el.timeframe === timeframe).name_ru_plur,
        percent: intPercent,
        tickers: tickers.join(' ,'),
      }),
      {
        reply_markup: getShiftConfigKeyboard(
          additionalShiftConfig,
          SHIFT_ACTIONS.additionalConfiguration
        ),
      }
    )

    return ctx.wizard.next()
  }
)

/**
 * Additional shift configuration after creation
 *
 * WARN: We do not leave the scene here so it keeps working in message history.
 * Potentially this could leak memory.
 * Not sure how many scenes have to hang around before that happens.
 */
const shiftAddAdditionalConfiguration = waitButtonClickStep(
  SHIFT_ACTIONS.additionalConfiguration,
  'shift_add_additional-configuration',
  async (ctx, actionPayload, _state) => {
    const { f, g, m } = actionPayload

    const config = {
      fallAlerts: Boolean(f),
      growAlerts: Boolean(g),
      muted: Boolean(m),
    }

    const { tickers, timeframe, percent, newShiftsId, timeframes } =
      ctx.wizard.state.shift

    await ctx.editMessageText(
      i18n.t('ru', 'shift_add_success', {
        time: timeframes.find((el) => el.timeframe === timeframe).name_ru_plur,
        percent,
        tickers: tickers.join(' ,'),
      }),
      {
        reply_markup: getShiftConfigKeyboard(
          config,
          SHIFT_ACTIONS.additionalConfiguration
        ),
        parse_mode: 'HTML',
      }
    )

    // Send the config update to DB
    await TimeShiftModel.updateMany(
      {
        _id: {
          $in: newShiftsId,
        },
      },
      { $set: config }
    )
  }
)

export const shiftScenes = new WizardScene(
  SHIFT_SCENES.add,
  startShiftAddScene,
  shiftAddHandleChooseSource,
  shiftHandleChooseTimeframes,
  shiftAddChooseTickers,
  shiftAddChoosePercent,
  shiftAddAdditionalConfiguration
)
