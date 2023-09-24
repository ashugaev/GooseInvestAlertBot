import { triggeredAlertKeyboad } from '@/commands/alert/keyboards/triggeredAlert'
import { alertMessage } from '@/commands/alert/messages/alert'
import { commandWrapper } from '@/helpers/commandWrapper'
import { getInstrumentByIdFromCache, PriceAlertModel } from '@/models'

export const repeatAlertVariants = commandWrapper(
  { availableForAdmins: true },
  async (ctx) => {
    const { _id } = JSON.parse(ctx.match[1])

    const alert = await PriceAlertModel.findOne({ _id }).lean()

    if (!alert) {
      await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
      return
    }

    const instrumentData = await getInstrumentByIdFromCache(alert.tickerId)

    ctx.editMessageText(alertMessage(alert, instrumentData), {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: triggeredAlertKeyboad({
          alert,
          clicked: true,
        }),
      },
    })
  }
)
