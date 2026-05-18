import { InstrumentsList, PriceAlert } from '@/models'
import { ValidatorResult } from '@/types'

export interface UserInputData {
  [key: string]: ValidatorResult
}

export interface AddAlertPayload {
  /**
   * List of price levels for alerts
   */
  prices?: number[]
  /**
   * Ticker
   */
  ticker?: string
  /**
   * Info about the ticker. May contain multiple entries.
   *
   * If the ticker has multiple instances, we will offer to pick one of them
   */
  instrumentsList?: InstrumentsList[]
  /**
   * Additional info message for alert
   */
  message?: string
  /**
   * Flag indicating that the alert has been created (saved to DB)
   */
  alertCreated?: boolean
  /**
   * Flag indicating that the message has been attached to the alert (saved to DB)
   */
  messageAttached?: boolean
  /**
   * Current price of the coin
   */
  currentPrice?: number
  /**
   * Created alert object from DB
   */
  createdItemsList?: PriceAlert[]
  /**
   * Flag indicating the alert was created as a copy
   */
  copy?: boolean
}
