import { logPrefixDevochki } from '@/features/signals/devochkiChannel/devochkiChannel.constants'
import { validateWithChatGPT } from '@/features/signals/devochkiChannel/gpt'
import { log } from '@/helpers'
import { bots } from '@/helpers/bot'
import { getLastPrice } from '@/helpers/getLastPrice'
import { newMarkenOrderFuturesBinance } from '@/marketApi/binance/api/order'
import { getInstrumentByTickerFromCache, InstrumentsList } from '@/models'
import { SignalDoubts, SignalModel, SignalType } from '@/models/Signal'
import { TrackChatCallbacksParams } from '@/models/TrackChat'

const usdtAmountForTrade = 15
const chatToNotify = -608497569

export const handleDevochkiChannelMessage = async (
  data: TrackChatCallbacksParams
) => {
  const pattern1 = /#[A-Z]{3,6}/ // ticker
  const pattern2 = /\d+%/ // number
  const pattern3 = /закреп/ // закреп notice
  const pattern4 = /(лонг|шорт)/ // type

  const signalItem = new SignalModel({
    message: data.message,
    messageId: data.messageId,
    channel: data.chatLinkName,
    validationStatus: 'notStarted',
  })

  try {
    if (
      !pattern1.test(data.message) ||
      !pattern2.test(data.message) ||
      !pattern3.test(data.message) ||
      !pattern4.test(data.message) ||
      data.message.length <= 40
    ) {
      signalItem.status = 'manualCheckFailed'
      throw 'Message is not valid'
      return
    }

    const AIRes = await validateWithChatGPT(data.message)

    if (!AIRes) {
      signalItem.status = 'aiCheckFailed'
      throw 'AI check failed'
    }

    signalItem.chatGptValidationMessage = AIRes

    let dataArr = null

    try {
      dataArr = JSON.parse(AIRes.replace(/'/g, '"'))
    } catch (e) {
      signalItem.status = 'aiAnswerInvalid'
      throw 'AI answer json is invalid'
    }

    const [ticker, level, tp, stop, type, doubts]: [
      string | null,
      number | null,
      number[] | null,
      number | null,
      SignalType | null,
      SignalDoubts | null
    ] = dataArr

    // Validate answer
    if (
      !ticker?.length ||
      !(level > 0) ||
      !tp?.length ||
      !tp?.every((el) => el > 0) ||
      !(stop > 0) ||
      !type?.match(/(buy|sell)/) ||
      !doubts?.match(/(yes|no)/)
    ) {
      signalItem.status = 'aiAnswerInvalid'
      throw 'AI answer is invalid'
    }

    signalItem.doubts = doubts
    signalItem.type = type

    const tickerPair = ticker + 'USDT'

    const tickersInfoArr: InstrumentsList[] =
      await getInstrumentByTickerFromCache(tickerPair)

    const tickerInfoBySource = tickersInfoArr.find(
      (el) => el.source === 'binanceFuture'
    )

    if (!tickerInfoBySource) {
      signalItem.status = 'tickerNotFound'
      throw 'Ticker not found'
    }

    // TODO: Проверка есть ли уже сделки по тикеру

    const price = getLastPrice(tickerInfoBySource.id, true)
    const volume = Number((usdtAmountForTrade / price).toFixed(2))

    signalItem.tickerPrice = price
    signalItem.volume = volume

    if (!price) {
      signalItem.status = 'priceNotFound'
      throw 'Price not found'
    }

    const levelPercent = (level / price - 1) * 100

    if (type === 'buy') {
      const buyMarketIfMore = 99.5
      const buyMarketIfLess = 100.5

      signalItem.type = 'buy'

      if (levelPercent > buyMarketIfLess) {
        await newMarkenOrderFuturesBinance({
          symbol: tickerPair,
          quantity: volume.toString(),
          side: 'BUY',
          type: 'LIMIT',
          limitPriceLevel: price.toString(),
          slPercent: stop,
          tpPercentArr: tp,
        })

        signalItem.orderType = 'limit'
        signalItem.status = 'done'
      } else if (
        levelPercent > buyMarketIfMore &&
        levelPercent < buyMarketIfLess
      ) {
        await newMarkenOrderFuturesBinance({
          symbol: tickerPair,
          quantity: volume.toString(),
          side: 'BUY',
          type: 'MARKET',
          slPercent: stop,
          tpPercentArr: tp,
        })

        signalItem.orderType = 'market'
        signalItem.status = 'done'
      } else {
        signalItem.status = 'lostLevel'
      }
    }
    if (type === 'sell') {
      const sellMarketIfMore = 100.5
      const sellMarketIfLess = 99.5

      signalItem.type = 'sell'

      if (levelPercent < sellMarketIfLess) {
        await newMarkenOrderFuturesBinance({
          symbol: tickerPair,
          quantity: volume.toString(),
          side: 'SELL',
          type: 'LIMIT',
          limitPriceLevel: price.toString(),
          slPercent: stop,
          tpPercentArr: tp,
        })

        signalItem.orderType = 'limit'
        signalItem.status = 'done'
      } else if (
        levelPercent > sellMarketIfLess &&
        levelPercent < sellMarketIfMore
      ) {
        await newMarkenOrderFuturesBinance({
          symbol: tickerPair,
          quantity: volume.toString(),
          side: 'SELL',
          type: 'MARKET',
          slPercent: stop,
          tpPercentArr: tp,
        })

        signalItem.orderType = 'market'
        signalItem.status = 'done'
      } else {
        signalItem.status = 'lostLevel'
      }
    }

    // TODO: Say result to chat here

    // TODO: Смотрим что уже нет активной сделки по этому тикеру
    // TODO: Ожидание закрепления. Отправим с определнным статусом джобу в очередь
    // TODO: Удалить тейк профит и стоп, когда сделка закроется
    // TODO: Рассчет объема сделки
    // TODO: Уведомление о закрытии сделки в чат
    // TODO: Уведомление об открытии сделки
  } catch (e) {
    if (!(typeof e === 'string')) {
      signalItem.status = 'unexpectedError'
    }

    // TODO: Say result to chat here
    log.info(logPrefixDevochki, e)
  } finally {
    const message = `<b>💬 Обработка сообщения из чата</b>
    
    ${
      '❗Ордер <b>' +
      (signalItem.status === 'done' ? 'ВЫСТАВЛЕН' : 'НЕ ВЫСТАВЛЕН') +
      '</b>'
    }

    ${Object.entries(signalItem)
      .map(([key, value]) => `<b>${key}</b>: ${value}`)
      .join('\n')}    
    `

    await (
      await bots
    )[0].telegram.sendMessage(chatToNotify, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      disable_notification: true,
    })

    signalItem.save()
  }
}
