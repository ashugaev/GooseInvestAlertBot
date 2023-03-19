import * as process from 'process'

export const sayToBoss = async ({ bot, message }) => {
  await bot.telegram.sendMessage(process.env.BOSS_TG_ID, message, {
    parse_mode: 'HTML',
    disable_web_page_preview: true
  })
}
