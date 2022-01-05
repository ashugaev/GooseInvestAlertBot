/**
 * Результаты выполнения валидатора для ввода юзера
 */
export interface ValidatorResult {
  /**
     * То что ввел юзер
     */
  value: string
  /**
     * То что в итоге будем использовать
     */
  normalized: unknown
  /**
     * Признак того, что значение проверно и корректно
     */
  isValid: boolean
}
