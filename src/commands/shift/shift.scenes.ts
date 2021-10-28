import * as WizardScene from 'telegraf/scenes/wizard'
import * as Composer from 'telegraf/composer'
import { i18n } from '../../helpers/i18n'
import { log } from '../../helpers/log'
import { sceneWrapper } from '../../helpers/sceneWrapper'
import { SHIFT_ACTIONS, SHIFT_MAX_PERCENT, SHIFT_SCENES } from './shift.constants'
import { getInstrumentInfoByTicker } from '../../models'
import { getTimeframesKeyboard } from './shift.keyboards'
import { triggerActionRegexp } from '../../helpers/triggerActionRegexp'
import { TimeShiftModel } from '../../models/TimeShifts'

const startShiftAddScene = sceneWrapper('shift_add_start-scene', (ctx) => {
  ctx.replyWithHTML(i18n.t('ru', 'shift_add_startScene'))

  return ctx.wizard.next()
})

const shiftAddChooseTickers = new Composer()

// Не нечинается с /
shiftAddChooseTickers.hears(/^(?!\/).+$/, sceneWrapper('shift_add_choose-tickers', async (ctx) => {
  const { text: tickers } = ctx.message

  const tickersArr = tickers.trim().toUpperCase().split(' ')

  try {
    const tickersInfo = await getInstrumentInfoByTicker({ ticker: tickersArr })

    if (!tickersInfo.length) {
      await ctx.replyWithHTML(i18n.t('ru', 'shift_add_noTickers'))

      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }

    if (tickersInfo.length < tickersArr.length) {
      await ctx.replyWithHTML(i18n.t('ru', 'shift_add_wrongTicker', {
        tickers: tickersInfo.map(el => el.ticker).join(' ,')
      }))
    }

    ctx.wizard.state.shift = {
      tickers: tickersInfo.map(el => el.ticker),
      tickersInfo
    }

    const timeframes = ['1m', '1d']

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

// Не нечинается с /
shiftAddChooseTimeframes.action(triggerActionRegexp(SHIFT_ACTIONS.chooseTimeframe), sceneWrapper('shift_add_choose-timeframe', async (ctx) => {
  const { timeframe } = JSON.parse(ctx.match[1])

  ctx.wizard.state.shift.timeframe = timeframe

  await ctx.replyWithHTML(i18n.t('ru', 'shift_add_choosePercent'))

  return ctx.wizard.next()
}))

// Если сообщение не то, что ожидаем - покидаем сцену
shiftAddChooseTimeframes.on('message', (ctx, next) => {
  next()
  return ctx.scene.leave()
})

const shiftAddChoosePercent = new Composer()

// Не нечинается с '/'
shiftAddChoosePercent.hears(/^(?!\/).+$/, sceneWrapper('shift_add_choose-percent', async (ctx) => {
  const { text: percent } = ctx.message

  const intPercent = parseInt(percent)

  if (!intPercent || percent > SHIFT_MAX_PERCENT) {
    await ctx.replyWithHTML(i18n.t('ru', 'shift_add_error_maxPercent'))

    return ctx.wizard.selectStep(ctx.wizard.cursor)
  }

  const { tickers, timeframe } = ctx.wizard.state.shift
  const { id: user } = ctx.from

  const newShifts = tickers.map(ticker => ({
    percent: intPercent,
    timeframe,
    ticker,
    user
  }))

  await TimeShiftModel.insertMany(newShifts)

  await ctx.replyWithHTML(i18n.t('ru', 'shift_add_success', {
    timeframe,
    percent: intPercent,
    tickers: tickers.join(' ,')
  }))

  return ctx.scene.leave()
}))

// Если сообщение не то, что ожидаем - покидаем сцену
shiftAddChoosePercent.on('message', (ctx, next) => {
  next()
  return ctx.scene.leave()
})

export const shiftScenes = new WizardScene(SHIFT_SCENES.add,
  startShiftAddScene,
  shiftAddChooseTickers,
  shiftAddChooseTimeframes,
  shiftAddChoosePercent
)
