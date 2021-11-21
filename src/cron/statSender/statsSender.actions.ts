import { sendStatMessage } from './statSender.utils'
import { ShiftEventsModel } from '../../models/ShiftEvents'
import { log } from '../../helpers/log'
import { ShiftModel } from '../../models'

export const shiftAlertButtonClick = async (ctx) => {
  try {
    const {
      i: shiftEventId,
      m: muted
    } = JSON.parse(ctx.match[1])
    const { id: user } = ctx.from

    const event = (await ShiftEventsModel.find({ _id: shiftEventId }).lean())[0]

    await ShiftModel.updateOne({ _id: event.createdFor, user }, {
      $set: {
        muted
      }
    })

    await sendStatMessage({
      telegram: ctx,
      data: event,
      editMessage: true,
      muted
    })
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(e)
  }
}
