interface GetPriceFromStringParams {
  string: string
  lastPrice: number
}

interface IGetPriceFromString {
  prices: number[]
  invalidValues: string[]
}

export function getPricesFromString ({ string, lastPrice }: GetPriceFromStringParams): IGetPriceFromString {
  // -10 +10
  const relativeValueMinusRegExp = new RegExp(/^-([\d.]+)$/);
  const relativeValuePlusRegExp = new RegExp(/^\+([\d.]+)$/);

  // 10% +10% -10%
  const percentMinusRegExp = new RegExp(/^-([\d.]+)%$/);
  const percentPlusRegExp = new RegExp(/^(\+)?([\d.]+)%$/);

  // 10 30 59
  const pureNumberRegExp = new RegExp(/^[\d.]+$/);

  const invalidValues = [];

  const prices: number[] = string.split(' ').reduce((acc: number[], el) => {
    const stringVal = el.trim();

    if (!stringVal.length) {
      return acc;
    }

    const plusMatch = stringVal.match(relativeValuePlusRegExp);
    const minusMatch = stringVal.match(relativeValueMinusRegExp);
    const percentMinusMatch = stringVal.match(percentMinusRegExp);
    const percentPlusMath = stringVal.match(percentPlusRegExp);
    const pureNumberMatch = stringVal.match(pureNumberRegExp);

    let resultNumberVal;

    // Ищем паттерн, которому соответствует запись цены
    if (plusMatch) {
      resultNumberVal = lastPrice + parseFloat(plusMatch[1]);
    } else if (minusMatch) {
      resultNumberVal = lastPrice - parseFloat(minusMatch[1]);

      if (resultNumberVal < 0) {
        invalidValues.push(stringVal);

        resultNumberVal = null;
      }
    } else if (percentMinusMatch) {
      const percent = parseFloat(percentMinusMatch[1]);

      if (percent >= 100) {
        invalidValues.push(stringVal);

        resultNumberVal = null;
      } else {
        resultNumberVal = lastPrice - ((lastPrice / 100) * percent);
      }
    } else if (percentPlusMath) {
      const percent = parseFloat(percentPlusMath[2]);

      resultNumberVal = lastPrice + ((lastPrice / 100) * percent);
    } else if (pureNumberMatch) {
      resultNumberVal = parseFloat(stringVal);
    } else {
      invalidValues.push(stringVal);
    }

    // TODO: toFixedValue можно посчитать из шага, который лежит в данных инструмента
    const toFixedValue = lastPrice < 1 ? 5 : 2;

    resultNumberVal && acc.push(+resultNumberVal.toFixed(toFixedValue));

    return acc;
  }, []);

  return { prices, invalidValues };
}
