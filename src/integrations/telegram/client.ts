import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'

import { log } from '../../helpers'
import { sayToBoss } from '../../helpers/sayToBoss'

require('dotenv').config()

const {
  TELEGRAM_SIGNALS_API_ID,
  TELEGRAM_SIGNALS_API_HASH,
  TELEGRAM_SIGNALS_SESSION_STRING,
} = process.env

const stringSessionSignals = new StringSession(TELEGRAM_SIGNALS_SESSION_STRING)

export const signalsClient = new TelegramClient(
  stringSessionSignals,
  Number(TELEGRAM_SIGNALS_API_ID),
  TELEGRAM_SIGNALS_API_HASH,
  {
    connectionRetries: 5,
  }
)
;[signalsClient].forEach((cl) => {
  // The client may not finish starting up before first use, so retry-driven
  // callers must tolerate not-yet-connected state.
  cl.start({
    phoneNumber: async () => '', // Using session string only for server.
    phoneCode: async () => '', // Using session string only for server.
    onError: (err) => {
      sayToBoss({
        message:
          '<b>[Channel tracker crash]</b> Error while connecting to Telegram <pre>' +
          err.message +
          '</pre>',
      })
      console.log(err)
    },
  })
    .then(async () => {
      log.info('Telegram client started')
    })
    .catch((err) => {
      sayToBoss({ message: 'Signal client crashed' })
      log.error('Telegram client crashed', err)
    })
})
