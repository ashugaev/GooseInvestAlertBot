import input from 'input'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'

require('dotenv').config()

const { TELEGRAM_SIGNALS_API_ID, TELEGRAM_SIGNALS_API_HASH } = process.env

const stringSession = new StringSession('')

/**
 * Run manually with `npm run telegram:get-session-string`. Save the printed
 * string into .env as TELEGRAM_SIGNALS_SESSION_STRING so the bot can
 * authenticate as your Telegram user account without an interactive login.
 */
const generateSessionString = async () => {
  console.log('Loading...')

  const client = new TelegramClient(
    stringSession,
    Number(TELEGRAM_SIGNALS_API_ID),
    TELEGRAM_SIGNALS_API_HASH,
    {
      connectionRetries: 5,
    }
  )

  await client.start({
    phoneNumber: async () => await input.text('Please enter your number: '),
    password: async () => await input.text('Please enter your password: '),
    phoneCode: async () =>
      await input.text('Please enter the code you received: '),
    onError: (err) => console.log(err),
  })
  console.log('You should now be connected.')
  console.log(client.session.save()) // Save this string to avoid logging in again
}

generateSessionString()
