import { Api } from 'telegram'

import { client } from './client'

export const getChatHistory = async (cl) => {
  const result = await cl.invoke(
    new Api.messages.GetHistory({
      peer: 'DefiUniverse',
      // limit: 2,
    })
  )

  // @ts-ignore
  const lastMessage = result.messages[0]
  return result
}
;(async () => {
  const res = await getChatHistory(client)
  console.log('res', res.messages)
})()
