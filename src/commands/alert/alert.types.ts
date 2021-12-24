import { InstrumentsList } from '../../models'

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
}
