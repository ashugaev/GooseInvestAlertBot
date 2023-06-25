import { commandWrapper } from '../../helpers/commandWrapper'

export function setupId(bot) {
  bot.command(
    'id',
    commandWrapper({ availableForAdmins: false }, async (ctx) => {
      ctx.reply(ctx.from.id.toString())
    })
  )
}
