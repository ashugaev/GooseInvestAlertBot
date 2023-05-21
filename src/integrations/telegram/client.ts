import {TelegramClient} from "telegram"
import {StringSession} from "telegram/sessions"

import {sayToBoss} from "@/helpers/sayToBoss"

require('dotenv').config()

const {SESSION_STRING, TELEGRAM_API_HASH, TELEGRAM_API_ID} =  process.env

const stringSession = new StringSession(SESSION_STRING)

export const client = new TelegramClient(
  stringSession,
  Number(TELEGRAM_API_ID),
  TELEGRAM_API_HASH, {
    connectionRetries: 5,
  })

// Есть риск того, что клиент не успеет запуститься до момента обращения к нему
client.start({
  phoneNumber: async () => '', // Using Session string only for server
  phoneCode: async () => '', // Using Session string only for server
  onError: (err) => {
    sayToBoss({
      message: "<b>[Channel tracker crash]</b> Error while connecting to Telegram <pre>" + err.message + "</pre>"
    })
    console.log(err)
  },
})