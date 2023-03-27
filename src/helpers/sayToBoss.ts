import * as process from 'process'

const bossId = process.env.BOSS_TG_ID

export const sayToBoss = async ({ bot, message }) => {
  await bot.telegram.sendMessage(bossId, message, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    disable_notification: true
  })
}
