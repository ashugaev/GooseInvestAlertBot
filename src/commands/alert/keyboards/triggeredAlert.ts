import { Markup } from 'telegraf'

import { ALERT_ACTIONS } from '@/commands/alert/alert.constants'
import { createActionString } from '@/helpers'
import { PriceAlert } from '@/models'

export const triggeredAlertKeyboad = ({
  alert,
  clicked,
}: {
  alert: PriceAlert
  clicked: boolean
}) => {
  if (!clicked) {
    return [
      [
        Markup.callbackButton(
          '🔁 Повторить',
          createActionString(ALERT_ACTIONS.repeat, { _id: alert._id })
        ),
      ],
    ]
  }

  return [
    [
      Markup.callbackButton(
        '1️⃣ Та же цена',
        createActionString(ALERT_ACTIONS.repeatSamePrice, { _id: alert._id })
      ),
    ],
    [
      Markup.callbackButton(
        '2️⃣ Указать другие цены',
        createActionString(ALERT_ACTIONS.repeatDifferentPrice, {
          _id: alert._id,
        })
      ),
    ],
  ]
}
