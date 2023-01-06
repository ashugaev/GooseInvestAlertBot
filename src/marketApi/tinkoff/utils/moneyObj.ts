interface MoneyObj {
  units: number
  nano: number
}

export const moneyObjToValue = (moneyObj: MoneyObj): number => {
  return moneyObj.units + moneyObj.nano / 1000000000
}
