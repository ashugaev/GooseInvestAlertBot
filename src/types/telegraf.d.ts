// Dependencies
import { DocumentType } from '@typegoose/typegoose';
import { Middleware } from 'telegraf';
import { TelegrafContext } from 'telegraf/typings/context';
import I18N from 'telegraf-i18n';

import { ListCommandState } from '../commands/list/list.types';
import { User } from '../models';

interface CommandsState {
  listCommand: ListCommandState
}

declare module 'telegraf' {
  export class Context {
    dbuser: DocumentType<User>;
    i18n: I18N;
    session: CommandsState;
  }

  export interface Composer<TContext extends Context> {
    action(
      action: string | string[] | RegExp,
      middleware: Middleware<TelegrafContext>,
      ...middlewares: Array<Middleware<TelegrafContext>>
    ): Composer<TContext>
  }
}
