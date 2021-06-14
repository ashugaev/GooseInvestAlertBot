import { log } from "../helpers/log";
import { findUser } from '../models'
import { Context } from 'telegraf'

export async function attachUser(ctx: Context, next) {
  const userId = ctx.from?.id;

  // FIXME: Это костыль, который пропустит неавторизованного юзера в систему (может это бот. Не понятно)
  if(!userId) {
    log.error('Нет id юзера в ctx.from, грохаю сессию', ctx);

    return;
  }

  const dbuser = await findUser(userId)
  // @ts-ignore
  ctx.dbuser = dbuser
  next()
}
