import { Scenes } from '../../constants'
import { hoursToUtc } from '../../helpers/hoursToUtc'
import { i18n } from '../../helpers/i18n'
import { log } from '../../helpers/log'
import { plur } from '../../helpers/plural'
import { sceneWrapper } from '../../helpers/sceneWrapper'
import { createShift } from '../../models/Shifts'

const WizardScene = require('telegraf/scenes/wizard')
const Composer = require('telegraf/composer')

// TODO: Ask at the end for the time when to send the announcement

/**
 * The scene fires only on the first message that is text and not a command
 */

const startShiftAddScene = sceneWrapper('shift_add_start-scene', (ctx) => {
  ctx.replyWithHTML(i18n.t('ru', 'stat_add_startScene'))

  return ctx.wizard.next()
})

const shiftAddChoosePercentScent = new Composer()

// Does not start with /
shiftAddChoosePercentScent.hears(
  /^(?!\/).+$/,
  sceneWrapper('shift_add_choose-percent', async (ctx) => {
    const { text: percent } = ctx.message

    const floatPercent = parseFloat(percent)

    if (floatPercent) {
      await ctx.replyWithHTML(i18n.t('ru', 'shift_add_setTime'))

      ctx.wizard.state.percent = floatPercent

      return ctx.wizard.next()
    } else {
      ctx.replyWithHTML(i18n.t('ru', 'shift_add_setPercentError'))
      // Repeat the current step
      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }
  })
)

// If the message is not what we expect, leave the scene
shiftAddChoosePercentScent.on('message', (ctx, next) => {
  next()
  return ctx.scene.leave()
})

const shiftAddSetDays = new Composer()

// Does not start with /
shiftAddSetDays.hears(
  /^(?!\/).+$/,
  sceneWrapper('shift_add_set-time', async (ctx) => {
    const { text: hour } = ctx.message

    const intHour = parseInt(hour)

    if (intHour >= 0 && intHour <= 24) {
      await ctx.replyWithHTML(i18n.t('ru', 'shift_add_setDays'))

      ctx.wizard.state.hour = intHour

      return ctx.wizard.next()
    } else {
      ctx.replyWithHTML(i18n.t('ru', 'shift_add_setTimeError'))
      // Repeat the current step
      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }
  })
)

// If the message is not what we expect, leave the scene
shiftAddSetDays.on('message', (ctx, next) => {
  next()
  return ctx.scene.leave()
})

const shiftAddSetHourScene = new Composer()

// Does not start with '/'
shiftAddSetHourScene.hears(
  /^(?!\/).+$/,
  sceneWrapper('shift_add_setHour', async (ctx) => {
    const { text: days } = ctx.message
    const { id: user } = ctx.from
    const { percent, hour } = ctx.wizard.state

    const daysInt = parseInt(days)

    if (daysInt >= 1 && daysInt <= 30) {
      try {
        await createShift({
          percent,
          // For now, hardcode Moscow time and convert to UTC
          // TODO: Move timezone into a constant
          time: hoursToUtc(hour, -3),
          timeZone: 3,
          days: daysInt,
          user,
        })
      } catch (e) {
        ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'))
        log.error(e)
        return ctx.wizard.selectStep(ctx.wizard.cursor)
      }

      await ctx.replyWithHTML(
        i18n.t('ru', 'shift_add_created', {
          time: plur.hours(hour),
          days: plur.days(daysInt),
          percent,
        })
      )

      return ctx.scene.leave()
    } else {
      ctx.replyWithHTML(i18n.t('ru', 'shift_add_setDays_error'))
      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }
  })
)

// If the message is not what we expect, leave the scene
shiftAddSetHourScene.on('message', (ctx, next) => {
  next()
  return ctx.scene.leave()
})

export const statScenes = new WizardScene(
  Scenes.shiftAdd,
  startShiftAddScene,
  shiftAddChoosePercentScent,
  shiftAddSetDays,
  shiftAddSetHourScene
)
