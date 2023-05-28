import input from 'input'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'

require('dotenv').config()

const { TELEGRAM_API_ID, TELEGRAM_API_HASH } = process.env

const stringSession = new StringSession('')

/**
 * Must be called manually
 * Save this string to avoid logging in again in .evn file as TELEGRAM_SESSION_STRING
 */
const generateSessionString = async () => {
  console.log('Loading...')

  const client = new TelegramClient(
    stringSession,
    Number(TELEGRAM_API_ID),
    TELEGRAM_API_HASH,
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
