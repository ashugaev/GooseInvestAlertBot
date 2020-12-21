const symbols = {
    RUB: '₽',
    USD: '$'
}

export const symbolOrCurrency = (currency) => symbols[currency] || currency;
