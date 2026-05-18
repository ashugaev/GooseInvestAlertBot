/**
 * Types of lists (alerts) supported by the list command
 */
import { PriceAlert } from '@/models'

export enum EListTypes {
  shifts = 'shifts',
  levels = 'levels',
}

/**
 * State interface for the list command
 */
export interface ListCommandState {
  /**
   * Price levels
   */
  price: {
    /**
     * Tickers page
     */
    tickersPage?: number
    /**
     * Alerts page for the ticker
     */
    tickerAlertsPage?: number
    /**
     * Id of the clicked ticker whose alerts are open
     */
    selectedTickerId?: string
    /**
     * Id of the alert currently open (being edited)
     */
    selectedAlertId?: string
  }
  /**
   * Price velocity
   */
  shifts: {
    /**
     * Page of velocity trackers
     */
    page?: number
  }
  /**
   * Cached or normalized data
   */
  data: {
    /**
     * Cached list of alerts
     */
    alertsList: PriceAlert[]
    /**
     * Unique tickers sorted by name, used for pagination
     * TODO: Price-level data is not needed here. Drop it.
     */
    uniqTickersData: PriceAlert[]
  }
}

export enum ListActionsDataKeys {
  selectedTickerIdShortened = 'vdd',
  selectedAlertIdShortened = '3dd',
  selectedAlertId = 'eke',
  selectedAlertPage = 'ap',
  tickersListPage = 'tp',
}
