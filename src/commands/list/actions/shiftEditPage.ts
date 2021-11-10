import { i18n } from '../../../helpers/i18n'
import { log } from '../../../helpers/log'
import { TimeShiftModel } from '../../../models'
import { getTimeframesObjFromStoreOrDB } from '../utils/getTimeframesObjFromStoreOrDB'
import { shiftEditKeyboard } from '../keyboards/shiftEditKeyboard'

/**
 * Страница редактирования шифта
 */
export const shiftEditPage = async (ctx) => {
  try {
    const {
      // Данные достаточные для первичного вызова
      d: _id,
      p: page,
      // Данные, которые приходят уже после повторных вызовов
      m: muted,
      g: growAlerts,
      f: fallAlerts
    } = JSON.parse(ctx.match[1])
    const { id: user } = ctx.from

    const shiftData = (await TimeShiftModel.find({ _id, user }).lean())[0]

    if (!shiftData) {
      throw new Error('Не могу получить шифт по id')
    }

    let shiftDataCopy = shiftData;

    // Меняем параметры
    (typeof muted === 'number') && (shiftDataCopy = { ...shiftDataCopy, muted: Boolean(muted) });
    (typeof growAlerts === 'number') && (shiftDataCopy = { ...shiftDataCopy, growAlerts: Boolean(growAlerts) });
    (typeof fallAlerts === 'number') && (shiftDataCopy = { ...shiftDataCopy, fallAlerts: Boolean(fallAlerts) })

    // Если изменились параметры шифта
    if (shiftData !== shiftDataCopy) {
      // Апдейт параметров
      await TimeShiftModel.updateOne({ _id }, {
        $set: {
          muted: shiftDataCopy.muted,
          fallAlerts: shiftDataCopy.fallAlerts,
          growAlerts: shiftDataCopy.growAlerts
        }
      })
    }

    const timeframesObj = await getTimeframesObjFromStoreOrDB(ctx)

    const message = i18n.t('ru', 'alertsList_shifts_editOne', {
      name: shiftDataCopy.name,
      ticker: shiftDataCopy.ticker,
      growthOnly: shiftDataCopy.growAlerts && !shiftDataCopy.fallAlerts,
      fallOnly: shiftDataCopy.fallAlerts && !shiftDataCopy.growAlerts,
      change: shiftDataCopy.fallAlerts && shiftDataCopy.growAlerts,
      percent: shiftDataCopy.percent,
      time: timeframesObj[shiftDataCopy.timeframe].name_ru_plur
    })

    const keyboard = shiftEditKeyboard({
      page,
      shiftData: shiftDataCopy
    })

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: keyboard
      }
    })
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(e)
  }
}
