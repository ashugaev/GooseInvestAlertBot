import { PAY_ACTIONS } from '@/commands/pay/pay.constants'
import { createActionString } from '@/helpers'
import { i18n } from '@/helpers/i18n'

export const premiumDetailsButton = {
  text: i18n.t('ru', 'pay_showDetails'),
  callback_data: createActionString(PAY_ACTIONS.start, {}),
}
