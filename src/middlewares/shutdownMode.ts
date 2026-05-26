import { Context } from 'telegraf'

import { isShutdownMode } from '@/helpers/isShutdownMode'
import { log } from '@/helpers/log'

/* eslint-disable max-len */
export const SHUTDOWN_MESSAGE = `привет. я сделал гуся пять лет назад — тогда нигде не было удобных алертов по ценам. начал для себя, потом подтянулись люди.

решил, что пора закрывать. тянул так уже пару лет — жалко было пользователей. но дальше держать в анабиозе невыгодно никому: проект продолжает забирать деньги и фокус, а интереса и ресурса растить его у меня уже нет.

это был мой первый проект с живой аудиторией. до сих пор отношусь к нему тепло — поэтому хочется закрыть честно, а не молча выключить однажды.

если кому-то интересно взять бота себе и развивать — готов передать управление. не бесплатно. пишите @ashugaev.

что дальше:
— алерты и команды я уже выключил, сейчас бот только показывает это сообщение
— через неделю остановлю совсем
— код открыт: https://github.com/ashugaev/GooseInvestAlertBot — поднимайте у себя, ai-агенты справятся с настройкой
— если у вас активный премиум — напишите, верну деньги

спасибо что были с гусём 🖖`
/* eslint-enable max-len */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function shutdownMode(ctx: Context, next: () => any) {
  if (!isShutdownMode()) return next()
  // Skip updates without a chat (my_chat_member, chat_join_request, etc.).
  // ctx.reply asserts ctx.chat and throws otherwise; an unhandled throw inside
  // a middleware kills Telegraf 3.x's polling loop permanently (see
  // node_modules/telegraf/telegraf.js fetchUpdates: it flips polling.started
  // to false on any handleUpdates rejection), so a single chatless update
  // would stop the bot from ever reading another /help.
  if (!ctx.chat) return
  try {
    await ctx.reply(SHUTDOWN_MESSAGE)
  } catch (e) {
    // Per-send failures (e.g. user blocked the bot, Telegram rate-limit) must
    // not escape: same polling-loop kill switch as above.
    log.error('[SHUTDOWN MODE] reply failed', e)
  }
}
