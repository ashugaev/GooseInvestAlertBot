export function countDigitsAfterDecimal(number) {
  const numberString = number.toString()

  if (numberString.indexOf('.') === -1) {
    return 0
  }

  return numberString.length - numberString.indexOf('.') - 1
}