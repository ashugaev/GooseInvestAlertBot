/**
 * Bot-wide shutdown announcement.
 *
 * When `SHUTDOWN_MODE` is truthy, the shutdown middleware short-circuits every
 * update and replies with `SHUTDOWN_MESSAGE` (or the bundled default).
 */

/* eslint-disable max-len */
export const DEFAULT_SHUTDOWN_MESSAGE = `привет. я сделал гуся пять лет назад — тогда нигде не было удобных алертов по ценам. начал для себя, потом подтянулись люди.

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

const TRUTHY = new Set(['1', 'true', 'yes', 'on'])

export const isShutdownEnabled = (env: NodeJS.ProcessEnv): boolean => {
  const raw = env.SHUTDOWN_MODE
  if (!raw) return false
  return TRUTHY.has(raw.trim().toLowerCase())
}

export const getShutdownMessage = (env: NodeJS.ProcessEnv): string => {
  const override = env.SHUTDOWN_MESSAGE
  if (override && override.trim().length > 0) return override
  return DEFAULT_SHUTDOWN_MESSAGE
}
