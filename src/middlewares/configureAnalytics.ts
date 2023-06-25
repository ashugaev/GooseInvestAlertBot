import { TelegrafContext } from 'telegraf/typings/context'

import { addAnalyticsToReply, chb_m } from '../helpers/analytics'
import { log } from '../helpers/log'

export function configureAnalytics(
  ctx: TelegrafContext,
  next: () => Promise<void>
): void {
  try {
    chb_m({ ctx })
    addAnalyticsToReply(ctx)
  } catch (e) {
    log.error('Ошибка при конфигурации аналитики', e)
  } finally {
    next()
  }
}
