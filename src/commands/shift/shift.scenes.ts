import * as WizardScene from 'telegraf/scenes/wizard'
import * as Composer from 'telegraf/composer'
import { i18n } from '../../helpers/i18n'
import { log } from '../../helpers/log'
import { sceneWrapper } from '../../helpers/sceneWrapper'
import { SHIFT_ACTIONS, SHIFT_MAX_PERCENT, SHIFT_SCENES } from './shift.constants'
import { getInstrumentInfoByTicker, ShiftTimeframeModel } from '../../models'
import { getShiftConfigKeyboard, getTimeframesKeyboard } from './shift.keyboards'
import { triggerActionRegexp } from '../../helpers/triggerActionRegexp'
import { getTimeShiftsCountForUser, TimeShiftModel } from '../../models/TimeShifts'
import { Limits } from '../../constants'
import { IAdditionalShiftConfig } from './shift.types'

const startShiftAddScene = sceneWrapper('shift_add_start-scene', async (ctx) => {
  try {
    const { id: user } = ctx.from

    const userShiftsCount = await getTimeShiftsCountForUser(user)

    // Проверка на выход за лимиты
    if (userShiftsCount >= Limits.shifts) {
      await ctx.replyWithHTML(i18n.t('ru', 'shift_add_overlimit', {
        limit: Limits.shifts
      }))

      return ctx.scene.leave()
    }

    ctx.wizard.state.shift = ctx.wizard.state.shift || {}
    ctx.wizard.state.shift.userShiftsCount = userShiftsCount

    ctx.replyWithHTML(i18n.t('ru', 'shift_add_startScene'))

    return ctx.wizard.next()
  } catch (e) {
    ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'))
    log.error('[Shift] Add error', e)
    return ctx.wizard.selectStep(ctx.wizard.cursor)
  }
})

const shiftAddChooseTickers = new Composer()

// Не нечинается с /
shiftAddChooseTickers.hears(/^(?!\/).+$/, sceneWrapper('shift_add_choose-tickers', async (ctx) => {
  const { text: tickers } = ctx.message

  const tickersArr = tickers.trim().toUpperCase().split(' ')

  const { userShiftsCount } = ctx.wizard.state.shift

  try {
    const tickersInfo = await getInstrumentInfoByTicker({ ticker: tickersArr })

    if (!tickersInfo.length) {
      await ctx.replyWithHTML(i18n.t('ru', 'shift_add_noTickers'))

      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }

    if ((userShiftsCount + tickersInfo.length) > Limits.shifts) {
      await ctx.replyWithHTML(i18n.t('ru', 'shift_add_overlimit-less-tickers', {
        availableCount: Limits.shifts - userShiftsCount,
        limit: Limits.shifts
      }))

      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }

    if (tickersInfo.length < tickersArr.length) {
      await ctx.replyWithHTML(i18n.t('ru', 'shift_add_wrongTicker', {
        tickers: tickersInfo.map(el => el.ticker).join(' ,')
      }))
    }

    const timeframes = await ShiftTimeframeModel.find().lean()

    ctx.wizard.state.shift = ctx.wizard.state.shift || {}
    ctx.wizard.state.shift.tickers = tickersInfo.map(el => el.ticker)
    ctx.wizard.state.shift.tickersInfo = tickersInfo
    ctx.wizard.state.shift.timeframes = timeframes

    await ctx.replyWithHTML(i18n.t('ru', 'shift_add_chooseTimeframe'), {
      reply_markup: getTimeframesKeyboard(timeframes)
    })

    return ctx.wizard.next()
  } catch (e) {
    ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'))
    log.error('[Shift] Add error', e)
    return ctx.wizard.selectStep(ctx.wizard.cursor)
  }
}))

// Если сообщение не то, что ожидаем - покидаем сцену
shiftAddChooseTickers.on('message', (ctx, next) => {
  next()
  return ctx.scene.leave()
})

const shiftAddChooseTimeframes = new Composer()

shiftAddChooseTimeframes.action(triggerActionRegexp(SHIFT_ACTIONS.chooseTimeframe), sceneWrapper('shift_add_choose-timeframe', async (ctx) => {
  try {
    const { timeframe } = JSON.parse(ctx.match[1])

    ctx.wizard.state.shift.timeframe = timeframe

    await ctx.replyWithHTML(i18n.t('ru', 'shift_add_choosePercent'))

    return ctx.wizard.next()
  } catch (e) {
    ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'))
    log.error('[Shift] Add error', e)
    return ctx.wizard.selectStep(ctx.wizard.cursor)
  }
}))

// Если сообщение не то, что ожидаем - покидаем сцену
shiftAddChooseTimeframes.on('message', (ctx, next) => {
  next()
  return ctx.scene.leave()
})

const shiftAddChoosePercent = new Composer()

// Не нечинается с '/'
shiftAddChoosePercent.hears(/^(?!\/).+$/, sceneWrapper('shift_add_choose-percent', async (ctx) => {
  try {
    const { text: percent } = ctx.message

    const intPercent = parseFloat(percent)

    if (!intPercent || percent > SHIFT_MAX_PERCENT) {
      await ctx.replyWithHTML(i18n.t('ru', 'shift_add_error_maxPercent', {
        maxPercent: SHIFT_MAX_PERCENT
      }))

      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }

    const { tickers, timeframe, timeframes, tickersInfo } = ctx.wizard.state.shift
    const { id: user } = ctx.from

    const tickersInfoObj = tickersInfo.reduce((acc, el) => {
      acc[el.ticker] = el

      return acc
    }, {})

    // Дефолтные доп настройки для шифта, которые ставятся после создания
    const additionalShiftConfig: IAdditionalShiftConfig = {
      muted: true,
      growAlerts: true,
      fallAlerts: true
    }

    const newShifts = tickers.map(ticker => ({
      percent: intPercent,
      timeframe,
      ticker,
      user,
      name: tickersInfoObj[ticker].name,
      ...additionalShiftConfig
    }))

    try {
      const dbShifts = await TimeShiftModel.insertMany(newShifts)

      ctx.wizard.state.shift.percent = intPercent
      // @ts-expect-error
      ctx.wizard.state.shift.newShiftsId = dbShifts.map(el => el._id)

      await ctx.replyWithHTML(i18n.t('ru', 'shift_add_success', {
        time: timeframes.find(el => el.timeframe === timeframe).name_ru_plur,
        percent: intPercent,
        tickers: tickers.join(' ,')
      }), {
        reply_markup: getShiftConfigKeyboard(additionalShiftConfig, SHIFT_ACTIONS.additionalConfiguration)
      })
    } catch (e) {
      ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'))
      log.error('[Shift] Update addtional config error', e)
    }

    return ctx.wizard.next()
  } catch (e) {
    ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'))
    log.error('[Shift] Add error', e)
    return ctx.wizard.selectStep(ctx.wizard.cursor)
  }
}))

// Если сообщение не то, что ожидаем - покидаем сцену
shiftAddChoosePercent.on('message', (ctx, next) => {
  next()
  return ctx.scene.leave()
})

/**
 * Допнастройка шифта после его создания
 */
const shiftAddAdditionalConfiguration = new Composer()

shiftAddAdditionalConfiguration.action(triggerActionRegexp(SHIFT_ACTIONS.additionalConfiguration), sceneWrapper('shift_add_additional-configuration', async (ctx) => {
  const {
    f,
    g,
    m
  } = JSON.parse(ctx.match[1])

  const config = {
    fallAlerts: Boolean(f),
    growAlerts: Boolean(g),
    muted: Boolean(m)
  }

  const { tickers, timeframe, percent, newShiftsId, timeframes } = ctx.wizard.state.shift

  try {
    await ctx.editMessageText(i18n.t('ru', 'shift_add_success', {
      time: timeframes.find(el => el.timeframe === timeframe).name_ru_plur,
      percent,
      tickers: tickers.join(' ,')
    }), {
      reply_markup: getShiftConfigKeyboard(config, SHIFT_ACTIONS.additionalConfiguration),
      parse_mode: 'HTML'
    })

    // Отправить в базу апдейт конфига
    await TimeShiftModel.updateMany({
      _id: {
        $in: newShiftsId
      }
    }, { $set: config })
  } catch (e) {
    ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'))
    log.error('[Shift] Update addtional config error', e)
  }
}))

// WARN: Тут не выхожу из сцены, что бы она работала в истории сообщений.
//  Потенциально это может случить местом для утечки памяти.
//  Но хз сколько должно висеть сцен, что бы это произошло.

export const shiftScenes = new WizardScene(SHIFT_SCENES.add,
  startShiftAddScene,
  shiftAddChooseTickers,
  shiftAddChooseTimeframes,
  shiftAddChoosePercent,
  shiftAddAdditionalConfiguration
)
