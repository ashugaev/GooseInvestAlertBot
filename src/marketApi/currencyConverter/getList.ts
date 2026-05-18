interface CurrencyListApiResponseItem {
  symbol: string
  name: string
  symbol_native: string
  decimal_digits: number
  rounding: number
  code: string
  name_plural: string
}

export interface CurrencyApiSpecificData {
  symbol: string
  baseAssetData: CurrencyListApiResponseItem
  quoteAssetData: CurrencyListApiResponseItem
}
