interface MoneyObj {
  units: number
  nano: number
}

export const moneyObjToValue = (moneyObj: MoneyObj): number | null => {
  if (!moneyObj) {
    return null
  }

  // TODO: Validate. Possibly breaks when units is greater than 0
  return moneyObj.units + moneyObj.nano / 1000000000
}
