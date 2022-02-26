/**
 * Типы списков (алертов), поддерживаемые в list
 */
import { PriceAlert } from '@models';

export enum EListTypes {
  shifts = 'shifts',
  levels = 'levels'
}

/**
 * Интерфейс состояния команды list
 */
export interface ListCommandState {
  /**
   * Ценовые уровни
   */
  price: {
    /**
     * Страница с тикерами
     */
    tickersPage?: number
    /**
     * Страница с алертами для тикера
     */
    tickerAlertsPage?: number
    /**
     * Id кликнутого тикера алерты которого открыли
     */
    selectedTickerId?: string
    /**
     * Id алерта, которые открыли (реадктируем)
     */
    selectedAlertId?: string
  }
  /**
   * Скорости цены
   */
  shifts: {
    /**
     * Страница отслеживаний скорости
     */
    page?: number
  }
  /**
   * Закешированные или нормализованные данные
   */
  data: {
    /**
     * Закешированные список алертов
     */
    alertsList: PriceAlert[]
    /**
     * Сортированные по имены уникальные тикеры для пагинации
     * TODO: Там не нужны данные о ценовом уровне. Их нужно выкинуть.
     */
    uniqTickersData: PriceAlert[]
  }
}

export enum ListActionsDataKeys {
  selectedTickerId = 'vdd',
  selectedAlertId = 'eke'
}
