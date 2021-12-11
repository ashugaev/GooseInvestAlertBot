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
   * id монеты
   */
  instrumentId?: string
}
