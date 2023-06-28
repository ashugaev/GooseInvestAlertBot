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
        Извлеки данные из сообщений в указанном формате:
        [ticker:string|null], [ценаЗакрепления:number|null], [целиДляТейкПрофита:number|number[]|null], [стопЛоссВПроцентах:number|null], [типОрдера:buy|sell|null], [сомненияВСделке:yes|no]
        целиДляТейкПрофита - если тут указан, диапазон, то выбирай наименьшее число
        Примеры ответа: "LINA, 0.01420, [2, 4, 6, 8], 2.5, sell, yes", "BTC, 0.01420, null, 2.5, buy, yes", "BTC, 0.01420, 2, null, null, no", "null, null, [2, 4, 6, 8], null, sell, no"
      `,
        },
        {
          role: 'user',
          content:
            '#APE - при закреплении на уровне 2,2 - лонг Цели первые 2-4%, далее, сели продолжится рост, 6-8% стоп 2%',
        },
        {
          role: 'assistant',
          content: 'APE, 2,2, [2, 6], 2, buy, no',
        },
        {
          role: 'user',
          content:
            '#JASMY - сделка с повышенным риском на текущем рынке❗️ При закреплении на уровне 0,0047 - лонг цели 2-4-6% стоп 2% Кто не готов к риску, лучше пропустить.',
        },
        {
          role: 'assistant',
          content: 'JASMY, 0,0047, [2, 4, 6], 2, buy, yes',
        },
        {
          role: 'user',
          content:
            '#LINA - лонг, целей нет, стоп большой 2,5%, учитывайте риски!!!',
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
