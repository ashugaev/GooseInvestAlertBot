/**
 * Result of running a validator on user input
 */
export interface ValidatorResult {
  /**
   * What the user entered
   */
  value: string
  /**
   * The value we will ultimately use
   */
  normalized: unknown
  /**
   * Flag indicating the value passed validation
   */
  isValid: boolean
}
