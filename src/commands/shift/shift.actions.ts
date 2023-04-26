import {shiftsCache} from "@/cron/shiftsChecker"
import {getSourceMark} from "@/helpers/getSourceMark"

import { i18n } from '../../helpers/i18n'
import { log } from '../../helpers/log'
import {getInstrumentInfoByTicker, getTimeShifts, TimeShift, TimeShiftModel} from '../../models'
import { SHIFT_ACTIONS, SHIFT_TIMEFRAMES } from './shift.constants'
import { getShiftConfigKeyboard } from './shift.keyboards'

/**
 * Редактирование пришедшего алерта
 */
export const shiftAlertSettings = async (ctx) => {
  try {
    const {
      // Данные достаточные для первичного вызова
      d: _id,
      gr: isGrow,
      // Данные которые добавятся при самовызове
      m: muted,
      g: growAlerts,
      f: fallAlerts
    } = JSON.parse(ctx.match[1])

    const { id: user } = ctx.from

    // FIXME: Три похода в базу за раз это отстой :(

    const shiftData = (await getTimeShifts({
      chat: ctx.adminChatActive?.id,
      user: user,
      _id
    }))[0]

    const tickerInfo = (await getInstrumentInfoByTicker({ ticker: shiftData.ticker }))[0]

    const timeframesObj = SHIFT_TIMEFRAMES

    const shiftConfig = {
      muted: typeof muted === 'number' ? Boolean(muted) : shiftData.muted,
      growAlerts: typeof growAlerts === 'number' ? Boolean(growAlerts) : shiftData.growAlerts,
      fallAlerts: typeof fallAlerts === 'number' ? Boolean(fallAlerts) : shiftData.fallAlerts,
      gr: isGrow,
      d: _id
    }

    const keyboard = getShiftConfigKeyboard(shiftConfig, SHIFT_ACTIONS.alertSettings)

    await ctx.editMessageText(i18n.t(
      'ru',
      'shift_alert',
      {
        name: shiftData.name,
        percent: shiftData.percent,
        isGrow: Boolean(isGrow),
        time: timeframesObj[shiftData.timeframe].name_ru_plur,
        ticker: shiftData.ticker,
        source: getSourceMark(tickerInfo)
      }
    ), {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      disable_notification: shiftData.muted,
      reply_markup: keyboard
    })

    // TODO: Можно не делать апдейт, если данные не изменились
    // Апдейт параметров
    await TimeShiftModel.updateOne({ _id }, {
      $set: {
        muted: shiftConfig.muted,
        fallAlerts: shiftConfig.fallAlerts,
        growAlerts: shiftConfig.growAlerts
      }
    })
    shiftsCache.update()
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(e)
  }
}
