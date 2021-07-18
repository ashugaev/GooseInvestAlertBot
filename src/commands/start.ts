import { Extra } from 'telegraf'
import { commandWrapper } from '../helpers/commandWrapper'

export function setupStart (bot) {
  bot.command(['start'], commandWrapper(ctx => {
    const { first_name } = ctx.message.from

    const params = Extra
      .HTML(true)
      .webPreview(false)
      .markup((m) => m.keyboard([
        // TODO: Доделать кнопки снизу
        //     m.callbackButton(ctx.i18n.t('alert_button'))
        //     m.callbackButton(ctx.i18n.t('help_button'))
      ]))

    ctx.replyWithHTML(ctx.i18n.t('start', {
      first_name
    }),
    params
    )
  }))
}
