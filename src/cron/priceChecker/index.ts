/**
 * Old price checker for coingecko and tinkoff
 *
 * TODO: ПЕРЕЙТИ НА НОВУЮ ВЕРСИЮ ИЗ modules/priceChecker ПОСЛЕ ПОДКЛЮЧЕНИЯ АПДЕЙТЕРА ЦЕН ДЛЯ ВСЕХ АПИ
 */
import { getInstrumentDataWithPrice } from '../../helpers/getInstrumentData';
import { getInstrumentLink } from '../../helpers/getInstrumentLInk';
import { i18n } from '../../helpers/i18n';
import { log } from '../../helpers/log';
import { symbolOrCurrency } from '../../helpers/symbolOrCurrency';
import { wait } from '../../helpers/wait';
import {
  checkAlerts, getUniqOutdatedAlertsIds, PriceAlert, PriceAlertModel,
  removePriceAlert,
  setLastCheckedAt
} from '../../models';

let lastApiErrorSentrySentTime = 0;
const logPrefix = '[PRICE CHECKER]';

export const setupPriceCheckerOld = async (bot) => {
  // Ожидание преред запуском что бы не спамить на хотрелоаде
  // и успеть выполнить подготовительные ф-ции
  await wait(30000);

  while (true) {
    try {
      let ids = [];

      try {
        ids = await getUniqOutdatedAlertsIds(undefined, 100);
      } catch (e) {
        log.error('[setupPriceChecker] ошибка подключения к базе', e);
      }

      // Если пока нечего проверять
      if (!ids?.length) {
        await wait(10000);
        continue;
      } else {
        log.debug('Проверяю id', ids);
      }

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

          // Если по каким-то причинам данные об алерта не были получены
          //  то все равно поставим символу дату проверки, т.к. иначе для удаленных монет буедет
          //  копиться список, который рано или поздно вытеснит "живые монеты"
          //  FIXME: Если монета удалена - повещать юзера и ставить статус алерту DELETED_TICKER
          if (!result) {
            await setLastCheckedAt([symbolId]);
            log.info(logPrefix, 'Пропустил проверку цена для', symbolId);
            continue;
          }

          instrumentData = result.instrumentData;
          price = result.price;

          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          log.info(`${instrumentData.ticker}:${symbolId}:${price}`);

          const isPriceValidValue = typeof price === 'number' && price > 0;

          if (!isPriceValidValue) {
            throw new Error('Невалидная цена инструмента');
          }
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

        let triggeredAlerts = [];

        try {
          triggeredAlerts = await checkAlerts([[instrumentData.ticker, price, symbolId]]);
        } catch (e) {
          log.error('ошибка получения алертов', 'price', price, 'symbolId', symbolId, 'error', e);

          continue;
        }

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
};
