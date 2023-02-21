const SHORTENER_STORE: any[] = []

/**
 * Save short version of string
 */
export const shortenerCreateShort = (fullString: string) => {
  let index = SHORTENER_STORE.indexOf(fullString)

  if (index === -1) {
    index = SHORTENER_STORE.push(fullString) - 1
  }

  return index.toString()
}

/**
 * Returns full version of string by short
 */
export const shortenerGetFull = (shortString) => {
  const full = SHORTENER_STORE[shortString]

  if (!full) {
    throw new Error('Can\'t find full string by short')
  }

  return full
}
