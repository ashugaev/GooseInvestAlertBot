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

/**
 * To TEST
 * - short market
 * - short limit
 * - long market
 * - long limit
 */
export const handleDevochkiChannelMessage = async (
  data: TrackChatCallbacksParams
) => {
  const normalizedMessage = data.message
    // Remove all new lines and use dot instead
    .replace(/\n(.)/g, (_, sumbol) => '. ' + sumbol.toUpperCase())
    .trim()

  // Reset message patterns
  const pattern1 = /#[A-Z]{3,6}/ // ticker
  const pattern2 = /\d+%/ // number

  // Filter trash
  if (!pattern1.test(normalizedMessage) || !pattern2.test(normalizedMessage)) {
    return
  }

  // Notification will be sent if this patterns fails
  const pattern3 = /закреп/ // закреп notice

  const signalItem = new SignalModel({
    message: normalizedMessage,
    messageId: data.messageId,
    channel: data.chatLinkName,
    validationStatus: 'notStarted',
    chatTitle: data.chatTitle,
  })

  try {
    if (!pattern3.test(normalizedMessage) || normalizedMessage.length <= 40) {
      signalItem.status = 'manualCheckFailed'
      throw 'Message is not valid'
      return
    }

    const AIRes = await validateWithChatGPT(normalizedMessage)

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

    const [ticker, level, tp, stop, type = 'buy', doubts]: [
      string | null,
      number | null,
      number[] | null,
      number | null,
      SignalType | null,
      SignalDoubts | null
    ] = dataArr

    if (
      ticker === null ||
      level === null ||
      tp === null ||
      stop === null ||
      type === null
    ) {
      signalItem.status = 'Not enough data in AI answer'
      throw 'Not enough data in AI answer'
    }

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
      signalItem.status = 'AI answer is invalid'
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
      signalItem.status = 'Ticker not found'
      throw 'Ticker not found'
    }

    // TODO: Проверка есть ли уже сделки по тикеру

    const price = getLastPrice(tickerInfoBySource.id, true)
    const volume = Number((usdtAmountForTrade / price).toFixed(1))

    signalItem.tickerPrice = price
    signalItem.volume = volume

    if (!price) {
      signalItem.status = 'Price not found'
      throw 'Price not found'
    }

    const levelPercent = (level / price - 1) * 100

    if (type === 'buy') {
      const buyMarketIfMore = -1
      const buyMarketIfLess = 1

      signalItem.type = 'buy'

      if (levelPercent > buyMarketIfLess) {
        // await newMarkenOrderFuturesBinance({
        //   symbol: tickerPair,
        //   quantity: volume,
        //   side: 'BUY',
        //   type: 'LIMIT',
        //   limitPriceLevel: level,
        //   slPercent: stop,
        //   tpPercentArr: tp,
        // })

        signalItem.orderType = 'limit'
        signalItem.status = "Can't create limit order"

        // signalItem.status = 'Done'
        // signalItem.orderCreated = true
      } else if (
        levelPercent > buyMarketIfMore &&
        levelPercent < buyMarketIfLess
      ) {
        try {
          await newMarkenOrderFuturesBinance({
            symbol: tickerPair,
            quantity: volume,
            side: 'BUY',
            type: 'MARKET',
            slPercent: stop,
            tpPercentArr: tp,
          })
        } catch (e) {
          throw 'Binance order err: ' + e.message
        }

        signalItem.orderType = 'market'
        signalItem.status = 'Done'
        signalItem.orderCreated = true
      } else {
        signalItem.status = 'Lost level'
      }
    }
    if (type === 'sell') {
      const sellMarketIfMore = 1
      const sellMarketIfLess = -1

      signalItem.type = 'sell'

      if (levelPercent < sellMarketIfLess) {
        // await newMarkenOrderFuturesBinance({
        //   symbol: tickerPair,
        //   quantity: volume,
        //   side: 'SELL',
        //   type: 'LIMIT',
        //   limitPriceLevel: price.toString(),
        //   slPercent: stop,
        //   tpPercentArr: tp,
        // })

        signalItem.status = "Can't create limit order"
        signalItem.orderType = 'limit'
        // signalItem.orderCreated = true
        // signalItem.status = 'Done'
      } else if (
        levelPercent > sellMarketIfLess &&
        levelPercent < sellMarketIfMore
      ) {
        try {
          await newMarkenOrderFuturesBinance({
            symbol: tickerPair,
            quantity: volume,
            side: 'SELL',
            type: 'MARKET',
            slPercent: stop,
            tpPercentArr: tp,
          })
        } catch (e) {
          throw 'Binance order err: ' + e.message
        }

        signalItem.orderType = 'market'
        signalItem.status = 'Done'
        signalItem.orderCreated = true
      } else {
        signalItem.status = 'Lost level'
      }
    }

    // TODO: Смотрим что уже нет активной сделки по этому тикеру
    // TODO: Ожидание закрепления. Отправим с определнным статусом джобу в очередь
    // TODO: Удалить тейк профит и стоп, когда сделка закроется
    // TODO: Рассчет объема сделки
    // TODO: Уведомление о закрытии сделки в чат
    // TODO: Уведомление об открытии сделки
  } catch (e) {
    if (typeof e.message === 'string') {
      signalItem.status = e.message
    } else if (typeof e === 'string') {
      signalItem.status = e
    } else {
      signalItem.status = 'Unexpected error'
    }

    // TODO: Say result to chat here
    log.info(logPrefixDevochki, e)
  } finally {
    const message =
      `💬 Обработка сообщения: <b>${signalItem.chatTitle}</b>` +
      '\n\n' +
      `${
        `${signalItem.orderCreated ? '✅' : '🚫'}` +
        ' Ордер <b>' +
        (signalItem.orderCreated ? 'ВЫСТАВЛЕН' : 'НЕ ВЫСТАВЛЕН') +
        '</b>'
      }` +
      '\n\n' +
      `${Object.entries(signalItem.toJSON())
        .filter(([, value]) => Boolean(value))
        .filter(
          ([key]) =>
            !['_id', 'messageId', 'orderCreated', 'chatTitle'].includes(key)
        )
        .map(([key, value]) => `<b>${key.toUpperCase()}</b>: ${value}`)
        .join('\n')}`

    await (
      await bots
    )[0].telegram.sendMessage(chatToNotify, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      disable_notification: true,
    })

    await signalItem.save()
  }
}
