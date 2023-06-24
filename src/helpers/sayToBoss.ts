import * as process from 'process'

import { bots } from '@/helpers/bot'

const bossId = process.env.BOSS_TG_ID

export const sayToBoss = async ({ message }) => {
  await (
    await bots
  )[0].telegram.sendMessage(bossId, message, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    disable_notification: true,
  })
}
