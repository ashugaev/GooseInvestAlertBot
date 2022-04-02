import { ValidatorResult } from '@types';

import { InstrumentsList, PriceAlertItem } from '@models';

export interface UserInputData {
  [key: string]: ValidatorResult
}

export interface AddAlertPayload {
  /**
   * Список ценовых уровней для алертов
   */
  prices?: number[]
  /**
   * Тикер
   */
  ticker?: string
  /**
   * Инфо о тикере. Может быть несколько шт.
   *
   * Если тикер существует не в одном экземпляре, то предложим выбрать один из них
   */
  instrumentsList?: InstrumentsList[]
  /**
   * Additional info message for alert
   */
  message?: string
  /**
   * Признак того, что создали алерт (отправили в базу)
   */
  alertCreated?: boolean
  /**
   * Признак того, что сообщение добавлено к алерту (отправлено в базу)
   */
  messageAttached?: boolean
  /**
   * Текущая цена по монете
   */
  currentPrice?: number
  /**
   * Объект созданного алерта из DB
   */
  createdItemsList?: PriceAlertItem[]
}
