import { Context } from 'telegraf';

import { log } from '../helpers/log';
import { findUser, UserLimits } from '../models';

// Используется только тут. Экспортить лимиты из ctx.userLimits
enum Limits {
  priceLevels = 100,
  // Скорость цены
  shifts = 30,
}

export async function attachUser (ctx: Context, next) {
  const userId = ctx.from?.id;

  // FIXME: Это костыль, который пропустит неавторизованного юзера в систему (может это бот. Не понятно)
  if (!userId) {
    log.error('Нет id юзера в ctx.from, грохаю сессию', ctx);

    return;
  }

  const dbuser = await findUser(userId);
  // @ts-expect-error
  ctx.dbuser = dbuser;

  // Проставим лимиты юзера с приоритетом того, что пришло из базы
  const userLimits: UserLimits = {
    priceLevels: dbuser.limits?.priceLevels ?? Limits.priceLevels,
    shifts: dbuser.limits?.shifts ?? Limits.shifts
  };

  // @ts-expect-error: Типизировать данные в контексте
  ctx.userLimits = userLimits;

  next();
}
