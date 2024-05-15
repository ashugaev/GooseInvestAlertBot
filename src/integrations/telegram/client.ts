import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'

import { log } from '../../helpers'
import { sayToBoss } from '../../helpers/sayToBoss'

require('dotenv').config()

const {
  SESSION_STRING,
  TELEGRAM_API_HASH,
  TELEGRAM_API_ID,
  TELEGRAM_ANN_API_ID,
  TELEGRAM_ANN_SESSION_STRING,
  TELEGRAM_ANN_API_HASH,
  TELEGRAM_SIGNALS_API_ID,
  TELEGRAM_SIGNALS_API_HASH,
  TELEGRAM_SIGNALS_SESSION_STRING,
} = process.env

const stringSession = new StringSession(SESSION_STRING)
const stringSessionAnn = new StringSession(TELEGRAM_ANN_SESSION_STRING)
const stringSessionSignals = new StringSession(TELEGRAM_SIGNALS_SESSION_STRING)

// export const mainClient = new TelegramClient(
//   stringSession,
//   Number(TELEGRAM_API_ID),
//   TELEGRAM_API_HASH,
//   {
//     connectionRetries: 5,
//   }
// )

// export const annClient = new TelegramClient(
//   stringSessionAnn,
//   Number(TELEGRAM_ANN_API_ID),
//   TELEGRAM_ANN_API_HASH,
//   {
//     connectionRetries: 5,
//   }
// )

export const signalsClient = new TelegramClient(
  stringSessionSignals,
  Number(TELEGRAM_SIGNALS_API_ID),
  TELEGRAM_SIGNALS_API_HASH,
  {
    connectionRetries: 5,
  }
)
;[
  // mainClient,
  // annClient,
  // signalsClient,
].forEach((cl) => {
  // Есть риск того, что клиент не успеет запуститься до момента обращения к нему
  cl.start({
    phoneNumber: async () => '', // Using Session string only for server
    phoneCode: async () => '', // Using Session string only for server
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
