import { killBot } from '@/helpers/bot'
import { commandWrapper } from '@/helpers/commandWrapper'
import { i18n } from '@/helpers/i18n'

export const removeMyBotAction = commandWrapper(
  { availableForAdmins: true, availableForUsers: false },
  async (ctx) => {
    const { botId } = JSON.parse(ctx.match[1])

    await killBot(Number(botId), ctx)

    ctx.replyWithHTML(i18n.t('ru', 'mytoken_removed'))
  }
)
