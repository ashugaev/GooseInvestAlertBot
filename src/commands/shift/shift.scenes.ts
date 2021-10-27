import * as WizardScene from 'telegraf/scenes/wizard'
import * as Composer from 'telegraf/composer'
import { hoursToUtc } from '../../helpers/hoursToUtc'
import { i18n } from '../../helpers/i18n'
import { log } from '../../helpers/log'
import { sceneWrapper } from '../../helpers/sceneWrapper'
import { createShift } from '../../models/Shifts'
import { plur } from '../../helpers/plural'
import { SHIFT_SCENES } from './shift.constants'
import { getInstrumentInfoByTicker } from '../../models'

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

    console.log('tickersInfo', tickersInfo)

    if (!tickersInfo.length) {
      ctx.replyWithHTML(i18n.t('ru', 'shift_add_noTickers'))

      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }

    if (tickersInfo.length < tickers) {
      await ctx.replyWithHTML(i18n.t('ru', 'shift_add_wrongTicker', {
        tickers: tickersInfo.map(el => el.ticker).join(' ,')
      }))
    }

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

const shiftAddSetDays = new Composer()

// Не нечинается с /
shiftAddSetDays.hears(/^(?!\/).+$/, sceneWrapper('shift_add_set-time', async (ctx) => {
  const { text: hour } = ctx.message

  const intHour = parseInt(hour)

  if (intHour >= 0 && intHour <= 24) {
    await ctx.replyWithHTML(i18n.t('ru', 'shift_add_setDays'))

    ctx.wizard.state.hour = intHour

    return ctx.wizard.next()
  } else {
    ctx.replyWithHTML(i18n.t('ru', 'shift_add_setTimeError'))
    // Повторить текущий степ
    return ctx.wizard.selectStep(ctx.wizard.cursor)
  }
}))

// Если сообщение не то, что ожидаем - покидаем сцену
shiftAddSetDays.on('message', (ctx, next) => {
  next()
  return ctx.scene.leave()
})

const shiftAddSetHourScene = new Composer()

// Не нечинается с '/'
shiftAddSetHourScene.hears(/^(?!\/).+$/, sceneWrapper('shift_add_setHour', async (ctx) => {
  const { text: days } = ctx.message
  const { id: user } = ctx.from
  const { percent, hour } = ctx.wizard.state

  const daysInt = parseInt(days)

  if (daysInt >= 1 && daysInt <= 30) {
    try {
      await createShift({
        percent,
        // Пока хардкожу московское время, переводя его в utc
        // TODO: Вынести временную зону в константу
        time: hoursToUtc(hour, -3),
        timeZone: 3,
        days: daysInt,
        user
      })
    } catch (e) {
      ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'))
      log.error(e)
      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }

    await ctx.replyWithHTML(i18n.t('ru', 'shift_add_created', {
      time: plur.hours(hour),
      days: plur.days(daysInt),
      percent
    }))

    return ctx.scene.leave()
  } else {
    ctx.replyWithHTML(i18n.t('ru', 'shift_add_setDays_error'))
    return ctx.wizard.selectStep(ctx.wizard.cursor)
  }
}))

// Если сообщение не то, что ожидаем - покидаем сцену
shiftAddSetHourScene.on('message', (ctx, next) => {
  next()
  return ctx.scene.leave()
})

export const shiftScenes = new WizardScene(SHIFT_SCENES.add,
  startShiftAddScene,
  shiftAddChooseTickers
  // shiftAddSetDays,
  // shiftAddSetHourScene
)
