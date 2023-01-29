import { dropOutInvalidPrices, log } from '@helpers'
import {
  checkAlerts,
  getUniqOutdatedAlertsIds,
  InstrumentsList,
  setLastCheckedAt
} from '@models'
import { TickerPrices } from 'prices'

import { wait } from '../helpers/wait'
import { EMarketDataSources } from '../marketApi/types'

const logPrefix = '[PRICE CHECKER]'
const CRASH_WAIT_TIME = 30000

/**
 * Every mitTimeBetweenRequests does request updatePrice, then check triggered alerts
 */
export interface PriceCheckerParams {
  /**
     * The source to be checked
     */
  source: EMarketDataSources
  /**
     * tickerIds length will be equal maxTickersForRequest
     */
  getPrices: (tickerIds: Array<Pick<InstrumentsList, 'id'>>) => Promise<TickerPrices>
  /**
     * The maximum number that can be updated for one request of 'updateRequest' callback
     * null means all tickers for one request
     */
  maxTickersForRequest?: number
  /**
     * Mit timeout between requests
     * In ms
     */
  minTimeBetweenRequests: number
  /**
     * Sent message callback
     */
  sendUserMessage: () => void
  /**
     * Time in ms
     */
  waitTimeBeforeStart?: number
}

export const setupPriceChecker = async ({
  source,
  getPrices,
  maxTickersForRequest,
  minTimeBetweenRequests,
  sendUserMessage,
  waitTimeBeforeStart
}: PriceCheckerParams) => {
  if (waitTimeBeforeStart) {
    await wait(waitTimeBeforeStart)
  }

  let lastIterationStartTime = new Date().getTime()

  while (true) {
    let tickerIds = []

    // Делаем время между итерациями более предсказуемым учитывая время запроса
    const timeToWait = minTimeBetweenRequests - (new Date().getTime() - lastIterationStartTime)

    if (timeToWait > 0) {
      console.log('waiting', timeToWait)
      await wait(timeToWait)
    }

    lastIterationStartTime = new Date().getTime()

    // Get tickers to check
    try {
      tickerIds = await getUniqOutdatedAlertsIds(source, maxTickersForRequest)
    } catch (e) {
      log.error(logPrefix, 'Ошибка подключения к базе', e)

      await wait(CRASH_WAIT_TIME)
      continue
    }

    // If nothing to check
    if (!tickerIds?.length) {
      log.info(logPrefix, 'Нет тикеров для проверки')
      continue
    } else {
      log.debug(logPrefix, 'Checking tickerIds', tickerIds)
    }

    let prices = []

    // Get prices for tickers
    try {
      prices = await getPrices(tickerIds)
    } catch (e) {
      log.error(logPrefix, 'Get price error', e)
      await wait(CRASH_WAIT_TIME)
      continue
    } finally {
      // Ставим в любом случае что проверили цены.
      // Если вдруг накопятся непроверенные цены из-за мертвых тикеров,
      // то они могут начать ретраиться бесконечно
      // TODO: Сделать поле lastSuccessful check что бы можно было понять какие тикеры перестали проверяться
      await setLastCheckedAt(tickerIds)
    }

    // No prices case
    if (!prices?.length) {
      log.error(logPrefix, 'No prices found for tickers', tickerIds)
      continue
    }

    prices = dropOutInvalidPrices(prices)

    // No prices case
    if (!prices.length) {
      log.error(logPrefix, 'No prices after filtering')
      continue
    }

    let triggeredAlerts = []

    // Check triggered
    try {
      triggeredAlerts = await checkAlerts(prices)
    } catch (e) {
      log.error(logPrefix, 'Ошибка проверки сработавших алертов')

      continue
    }

    if (triggeredAlerts.length) {
      // TODO: Добавить сюда цены тригернутых алертов
      log.info(logPrefix, triggeredAlerts.length, 'Alerts triggered', triggeredAlerts.map(el => ([el.ticker, el.price])))
    }
  }

  /*

      ////////////////////

      while (true) {
          try {
              let ids = [];

              try {
                  ids = await getUniqOutdatedAlertsIds(100);
              } catch (e) {
                  log.error(logPrefix, 'ошибка подключения к базе', e);
              }

              ////////

              // Если пока нечего проверять
              if (!ids?.length) {
                  await wait(30000);
                  continue;
              } else {
                  log.debug('Проверяю id', ids);
              }

  ////

              for (let i = 0; ids.length > i; i++) {
                  const symbolId: string = ids[i];

                  const removeAlertsForSymbol = false;
                  let price;
                  let instrumentData;

                  try {
                      let result;

                      try {
                          result = (await getInstrumentDataWithPrice({ id: symbolId }))[0];
                      } catch (e) {
                          log.error(logPrefix, 'Ошибка проверки цены для', symbolId);
                          // NOTE: Пропуск итерации будет в условии ниже, потому
                      }

                      ////////////

                      // Если по каким-то причинам данные об алерта не были получены
                      //  то все равно поставим символу дату проверки, т.к. иначе для удаленных монет буедет
                      //  копиться список, который рано или поздно вытеснит "живые монеты"
                      //  FIXME: Если монета удалена - повещать юзера и ставить статус алерту DELETED_TICKER

                      if (!result) {
                          await setLastCheckedAt(symbolId);
                          log.info(logPrefix, 'Пропустил проверку цена для', symbolId);
                          continue;
                      }

                      //////////

                      instrumentData = result.instrumentData;
                      price = result.price;

                      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                      log.info(`${instrumentData.ticker}:${symbolId}:${price}`);

                      const isPriceValidValue = typeof price === 'number' && price > 0;

                      if (!isPriceValidValue) {
                          throw new Error('Невалидная цена инструмента');
                      }

                      /////////////

                  } catch (e) {
                      // Сейчас этот if не будет срабатывать из-за того хожу теперь в базу а не в апи за данными инструмента
                      if (typeof e === 'object' && e !== null && e.cantFind) {
                          // FIXME: Пока закомментил. Слишком опасное место.
                          //  Потенциально может выкосить все алерты
                          // removeAlertsForSymbol = true

                          log.error('Инструмент не найдет в апи', e);
                      } else {
                          const currentTime = new Date().getTime();

                          // Если прошло больше часа
                          const noSentry = (currentTime - lastApiErrorSentrySentTime) < 3600000;

                          if (noSentry) {
                              console.error('[PriceChecker] Ошибка получания цены для тикера', symbolId, e);

                              continue;
                          } else {
                              // У логгера под капотом отправка сообщения в sentry
                              log.error('[PriceChecker] Ошибка получания цены для тикера', symbolId, e);

                              lastApiErrorSentrySentTime = currentTime;
                          }
                      }

                      continue;
                  }

                   ///////////

                  // Если инструмента больше нет в апи
                  if (removeAlertsForSymbol) {
                      log.debug('Удаляю все по symbolId', symbolId);

                      const alertsToRemove = await PriceAlertModel.find({ tickerId: symbolId }).lean();

                      for (let j = 0; alertsToRemove.length > j; j++) {
                          const alert = alertsToRemove[j];

                          try {
                              // TODO: Удалаять алерт после нескольки падений отправки
                              //  Сейчас удалится даже если упадет отрпавка сообщения
                              await removePriceAlert({ _id: alert._id });

                              await bot.telegram.sendMessage(alert.user, i18n.t(
                                      'ru', 'priceCheckerErrorCantFind',
                                      { price: alert.lowerThen || alert.greaterThen, symbol: alert.symbol }
                                  ),
                                  {
                                      parse_mode: 'HTML'
                                  }
                              );
                          } catch (e) {
                              log.error('Ошибка отправки сообщения юзеру', e);
                          }
                      }

                      continue;
                  }

                  ///////

                  let triggeredAlerts = [];

                  try {
                      triggeredAlerts = await checkAlerts({ id: symbolId, price });
                  } catch (e) {
                      log.error('ошибка получения алертов', 'price', price, 'symbolId', symbolId, 'error', e);

                      continue;
                  }

  //////////////

                  if (triggeredAlerts?.length) {
                      log.debug('Сработали алерты', triggeredAlerts, ' Цена: ', price, ' symbolId:', symbolId);

                      for (let j = 0; triggeredAlerts.length > j; j++) {
                          const alert: PriceAlert = triggeredAlerts[j];
                          const { message, lowerThen, greaterThen, type, source } = alert;
                          const price = lowerThen || greaterThen;

                          try {
                              await bot.telegram.sendMessage(alert.user,
                                  i18n.t('ru', 'priceChecker_triggeredAlert', {
                                      symbol: instrumentData.ticker,
                                      name: instrumentData.name,
                                      currency: symbolOrCurrency(alert.currency),
                                      greaterThen,
                                      price,
                                      message,
                                      link: type && getInstrumentLink({ type, ticker: instrumentData.ticker, source })
                                  }),
                                  {
                                      parse_mode: 'HTML',
                                      disable_web_page_preview: true
                                  });

                              // TODO: Удалаять алерт после нескольки падений отправки
                              await removePriceAlert({ _id: alert._id });
                          } catch (e) {
                              // Если юзер блокнул бота
                              // TODO: Проверить сценарий
                              if (e.code === 403) {
                                  try {
                                      await removePriceAlert({ _id: alert._id });
                                      log.info('Алерт удален из-за блокировки юзером', alert);
                                  } catch (e) {
                                      log.error('Ошибка удаления алерта', e);
                                  }
                              } else {
                                  log.error('Ошибка отправки сообщения юзеру', e);
                              }
                          }
                      }
                  }
              }
          } catch (e) {
              log.error('[SUPER_CRASH] Падает мониториг цен', e);
              await wait(10000);
          }
      }

      */
}
