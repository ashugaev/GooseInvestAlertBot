import { ALERT_SCENES } from '@/commands/alert/alert.constants'
import { triggeredAlertKeyboad } from '@/commands/alert/keyboards/triggeredAlert'
import { alertMessage } from '@/commands/alert/messages/alert'
import { createAlertInDb } from '@/commands/alert/utils/createAlertInDb'
import { log } from '@/helpers'
import { commandWrapper } from '@/helpers/commandWrapper'
import { getInstrumentByIdFromCache, PriceAlertModel } from '@/models'
const { set } = require('lodash')

const logPrefix = '[ALERT repeatWithDifferentPrice]'

export const repeatWithDifferentPrice = commandWrapper(
  { availableForAdmins: true },
  async (ctx) => {
    const { _id } = JSON.parse(ctx.match[1])

    const alert = await PriceAlertModel.findOne({ _id }).lean()
    const instrumentData = await getInstrumentByIdFromCache(alert.tickerId)

    // @ts-ignore
    ctx.scene.enter(ALERT_SCENES.askPrice, {
      payload: {
        instrumentsList: [instrumentData],
      },
      callback: async (state) => {
        createAlertInDb({
          ctx,
          payload: {
            instrumentsList: [instrumentData],
            prices: state.prices,
            currentPrice: state.currentPrice,
            copy: true,
          },
          callback: (arg) => {
            log.info(logPrefix, 'create alert in DB by duplicate success', arg)
          },
        }).catch(async (e) => {
          await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
          log.error(logPrefix, 'create alert in DB crash', e)
        })
      },
    })

    ctx.editMessageText(alertMessage(alert, instrumentData), {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: triggeredAlertKeyboad({
          alert,
          clicked: false,
        }),
      },
    })
  }
)
