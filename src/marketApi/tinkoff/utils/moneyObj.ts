interface MoneyObj {
  units: number
  nano: number
}

export const moneyObjToValue = (moneyObj: MoneyObj): number => {
  // TODO: Проверить правильность. Возможно когд units больше 0 то все ломается
  return moneyObj.units + moneyObj.nano / 1000000000
}
