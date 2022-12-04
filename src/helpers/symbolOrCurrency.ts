export const symbols = {
  RUB: '₽',
  rub: '₽',
  USD: '$',
  usd: '$',
  EUR: '€',
  eur: '€'
};

export const symbolOrCurrency = (currency: string): string => currency && (symbols[currency] || ' ' + currency);
