export const symbols = {
    RUB: '₽',
    USD: '$',
    EUR: '€'
}

export const symbolOrCurrency = (currency) => symbols[currency] || currency;
