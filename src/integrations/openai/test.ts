import { validateWithChatGPT } from '@/features/signals/devochkiChannel/gpt'
;(async () => {
  const res = await validateWithChatGPT('')

  console.log('res', res)
})()
