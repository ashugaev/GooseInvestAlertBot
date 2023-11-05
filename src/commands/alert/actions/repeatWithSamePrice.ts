import { triggeredAlertKeyboad } from '@/commands/alert/keyboards/triggeredAlert'
import { alertMessage } from '@/commands/alert/messages/alert'
import { commandWrapper } from '@/helpers/commandWrapper'
import { getLastPrice } from '@/helpers/getLastPrice'
import { getSourceMark } from '@/helpers/getSourceMark'
import { i18n } from '@/helpers/i18n'
import {
  addPriceAlerts,
  getInstrumentByIdFromCache,
  PriceAlert,
  PriceAlertModel,
} from '@/models'

export const repeatWithSamePrice = commandWrapper(
  { availableForAdmins: true },
  async (ctx) => {
    const { _id } = JSON.parse(ctx.match[1])

    const alert = await PriceAlertModel.findOne({ _id }).lean()
    const instrumentData = await getInstrumentByIdFromCache(alert.tickerId)

    const targetPrice = alert.greaterThen || alert.lowerThen
    const currentPrice = getLastPrice(instrumentData.id, true)

    const currentPriceBiggerThanTarget = currentPrice > targetPrice

    const newAlertParams: PriceAlert = {
      ...alert,
      // Resetting the alert params
      triggered: false,
      removed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      initialPrice: currentPrice,
      createdAsACopy: true,
      // target higher than current than waiting grow
      greaterThen: currentPriceBiggerThanTarget ? undefined : targetPrice,
      lowerThen: currentPriceBiggerThanTarget ? targetPrice : undefined,
      _id: undefined,
      // @ts-ignore
      _v: undefined,
    }

    await addPriceAlerts([newAlertParams])

    const i18nParams = {
      price: newAlertParams.greaterThen || newAlertParams.lowerThen,
      symbol: newAlertParams.symbol,
      name: newAlertParams.name,
      invalid: null,
      onePrice: true,
      source: getSourceMark(instrumentData),
    }

    await ctx.replyWithHTML(i18n.t('ru', 'alertCreated', i18nParams), {
      disable_web_page_preview: true,
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
