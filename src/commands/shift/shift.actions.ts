import { log } from '../../helpers/log'
import { i18n } from '../../helpers/i18n'
import { getInstrumentLink } from '../../helpers/getInstrumentLInk'
import { getInstrumentInfoByTicker, TimeShiftModel } from '../../models'
import { getTimeframesObjFromStoreOrDB } from '../list/utils/getTimeframesObjFromStoreOrDB'
import { getShiftConfigKeyboard } from './shift.keyboards'
import { SHIFT_ACTIONS } from './shift.constants'

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

    const shiftData = (await TimeShiftModel.find({ _id, user }).lean())[0]

    const tickerInfo = (await getInstrumentInfoByTicker({ ticker: shiftData.ticker }))[0]

    const timeframesObj = await getTimeframesObjFromStoreOrDB(ctx)

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
        link: getInstrumentLink({
          type: tickerInfo.type,
          source: tickerInfo.source,
          ticker: shiftData.ticker
        })
      }
    ), {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      disable_notification: shiftData.muted,
      reply_markup: keyboard
    })

    // TODO: Можно не делать апдейт, если данные не изменились
    // Апдейт параметров
    await TimeShiftModel.updateOne({ _id, user }, {
      $set: {
        muted: shiftConfig.muted,
        fallAlerts: shiftConfig.fallAlerts,
        growAlerts: shiftConfig.growAlerts
      }
    })
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(e)
  }
}
