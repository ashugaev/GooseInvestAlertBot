import { responseCache } from '@/marketApi/currencyConverter/currenciesListResponseCache'

export const symbols =
  Object.values(responseCache?.data ?? {})?.reduce((acc, el) => {
    acc[el.code] = el.symbol_native
    return acc
  }, {}) ?? {}

export const getSymbolByTicker = (currency: string): string =>
  currency && (symbols[currency?.toUpperCase()] || ' ' + currency)
