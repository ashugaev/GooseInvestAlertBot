/* eslint-disable max-len */

import { logPrefixDevochki } from '@/features/signals/devochkiChannel/devochkiChannel.constants'
import { log } from '@/helpers'
import { createUniqueHash } from '@/helpers/uniqueHash'
import { openai } from '@/integrations/openai'

const getChatGptReqParams = ({ message }) => ({
  model: 'gpt-3.5-turbo',
  max_tokens: 50,
  temperature: 0,
  messages: [
    {
      role: 'system',
      content: `
        Извлеки данные из сообщений в указанном формате:
        [[ticker:string|null], [ценаЗакрепления:number|null], [целиДляТейкПрофита:number|number[]|null], [стопЛоссВПроцентах:number|null], [типОрдера:buy|sell|null], [сомненияВСделке:yes|no]]
        целиДляТейкПрофита - если тут указан, диапазон, то выбирай наименьшее число
        Все строки должны быть обернуты в одинарные кавычки результатом должен быть валидный массив
        Для дробных чисел используй точку
        Примеры валидного ответа: 
          ['LINA', 0.01420, [2, 4, 6, 8], 2.5, 'sell', 'yes'], 
          ['BTC', 0.01420, null, 2.5, 'buy', 'yes'], 
          ['BTC', 0.01420, [2], null, null, 'no'], 
          [null, null, [2, 4, 6, 8], null, 'sell', 'no']
      `,
    },
    {
      role: 'user',
      content:
        '#APE - при закреплении на уровне 2,2 - лонг Цели первые 2-4%, далее, сели продолжится рост, 6-8% стоп 2%',
    },
    {
      role: 'assistant',
      content: "['APE', 2.2, [2, 6], 2, 'buy', 'no']",
    },
    {
      role: 'user',
      content:
        '#JASMY - сделка с повышенным риском на текущем рынке❗️ При закреплении на уровне 0,0047 - лонг цели 2-4-6% стоп 2% Кто не готов к риску, лучше пропустить.',
    },
    {
      role: 'assistant',
      content: "['JASMY', 0.0047, [2, 4, 6], 2, 'buy', 'yes']",
    },
    {
      role: 'user',
      content: message,
    },
  ],
})

export const chatGptRequestHash = createUniqueHash(
  getChatGptReqParams({ message: 'test' })
)

// TODO: Проверка на рекламу
// TODO: Классификация сигнала
export const validateWithChatGPT = async (message) => {
  try {
    const chat_completion = await openai.createChatCompletion(
      getChatGptReqParams({ message })
    )

    if (chat_completion.status === 200) {
      const answer = chat_completion.data.choices?.[0]?.message?.content
      if (answer.length) {
        return answer
      } else {
        log.error(logPrefixDevochki, 'Chat GPT answer is empty')
        return null
      }
    } else {
      log.error(
        logPrefixDevochki,
        'Not 200 status from chat GPT',
        chat_completion.statusText
      )
      return null
    }
  } catch (e) {
    console.log(e)
    return null
  }
}
