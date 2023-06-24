const { Configuration, OpenAIApi } = require('openai')

require('dotenv').config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

;(async () => {
  try {
    const chat_completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      max_tokens: 50,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `
        Тебе нужно извлечь данные из сообщений, которые я буду присылать. Никаких объяснений, только данные в таком формате:
        [ticker:string|null], [ценаЗакрепления:number|null], [целиДляТейкПрофита:number|number[]|null], [стопЛоссВПроцентах:number|null], [типОрдера:buy|sell|null]
        целиДляТейкПрофита - если тут указан, диапазон, то выбирай наименьшее число
        Нельзя указывать данные которых нет в сообщении! 
        Примеры ответа: "LINA, 0.01420, [2, 4, 6, 8], 2.5, sell", "BTC, 0.01420, null, 2.5, buy", "BTC, 0.01420, 2, null, null", "null, null, [2, 4, 6, 8], null, sell"
      `,
        },
        {
          role: 'user',
          content:
            '#APE - при закреплении на уровне 2,2 - лонг Цели первые 2-4%, далее, сели продолжится рост, 6-8% стоп 2%',
        },
        {
          role: 'assistant',
          content: 'APE, 2,2, [2, 6], 2, buy',
        },
        {
          role: 'user',
          content:
            '#LINA - при закреплении на уровне 0,01420 - лонг цели первые 2-4%, далее 6-8%, если продолжится рост стоп большой 2,5%, учитывайте риски!!!',
        },
      ],
    })

    debugger

    console.log(chat_completion.data.choices)
  } catch (e) {
    debugger

    console.log(e)
  }
})()
