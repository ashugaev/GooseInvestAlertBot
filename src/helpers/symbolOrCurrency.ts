export const symbols = {
  RUB: '₽',
  USD: '$',
  EUR: '€'
};

export const symbolOrCurrency = (currency: string): string => symbols[currency] || currency;
