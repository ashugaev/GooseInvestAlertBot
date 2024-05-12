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

    // Невалидное значение
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
 * Ask: Биржа
 * */
const startShiftAddScene = immediateStep(
  'shift_add_start-scene',
  async (ctx: Context) => {
    // Добавлено уже у юзера
    const userShiftsCount = await getTimeShiftsCount({
      user: ctx.from.id,
      chat: ctx.adminChatActive?.id,
      botId: ctx.goose.id,
    })

    // Лимиты для этого юзера
    const shiftsLimitForUser = ctx.limits.shifts

    // Закинем в состояние для следующих шагов
    set(ctx, 'wizard.state.shift.limit', shiftsLimitForUser)
    set(ctx, 'wizard.state.shift.userShiftsCount', userShiftsCount)

    // Проверка на выход за лимиты
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

    // Спрашиваем биржу
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
 * Handle: Результат выбора биржи
 * Ask: Список тикеров
 */
const shiftAddHandleChooseSource = waitButtonClickStep(
  SHIFT_ACTIONS.chooseSource,
  'shift_add_choose-source',
  async (ctx, actionsPayload, state) => {
    // Сохраним биржу в стейт
    set(state, 'shift.source', actionsPayload.source)

    // Спросим таймфрейм
    await ctx.replyWithHTML(i18n.t('ru', 'shift_add_chooseTimeframe'), {
      reply_markup: getTimeframesKeyboard(
        SHIFT_TIMEFRAMES_BY_SOURCE_CONFIG[actionsPayload.source]
      ),
    })

    return ctx.wizard.next()
  }
)

/**
 * Handle: Результат выбора таймфрейма
 * Ask: Список тикров
 */
const shiftHandleChooseTimeframes = waitButtonClickStep(
  SHIFT_ACTIONS.chooseTimeframe,
  'shift_add_choose-timeframe',
  async (ctx, actionPayload, state) => {
    const { timeframe } = actionPayload

    // Сохраним таймфрейм
    set(state, 'shift.timeframe', timeframe)

    // Спросим тикеры
    await ctx.replyWithHTML(i18n.t('ru', 'shift_add_chooseTickers'))

    return ctx.wizard.next()
  }
)

/**
 * Handle: Список тикеров
 * Ask: Процент
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

    // Если нет таких тикеров в базе по бирже
    if (!tickersInfo.length) {
      await ctx.replyWithHTML(
        i18n.t('ru', 'shift_add_noTickers', {
          source: SOURCE_CONFIG[source].fullName,
        })
      )

      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }

    // Если юзер выходит за лимиты
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

    // Если нашли только часть тикеров на бирже
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

    // Спросим процент изменения для отслеживания
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

    // Невалидное значение
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

    // Дефолтные доп настройки для шифта, которые ставятся после создания
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

    // Успешное добавление
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
 * Доп настройка шифта после его создания
 *
 * WARN: Тут не выхожу из сцены, что бы она работала в истории сообщений.
 * Потенциально это может случить местом для утечки памяти.
 * Но хз сколько должно висеть сцен, что бы это произошло.
 */
const shiftAddAdditionalConfiguration = waitButtonClickStep(
  SHIFT_ACTIONS.additionalConfiguration,
  'shift_add_additional-configuration',
  async (ctx, actionPayload, state) => {
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

    // Отправить в базу апдейт конфига
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
