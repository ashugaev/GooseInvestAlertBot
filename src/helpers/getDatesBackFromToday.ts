export const getDatesBackFromToday = (days: number):{dateTo: string, dateFrom: string} => {
  const dateTo = new Date()
  const dateToISO = dateTo.toISOString()

  dateTo.setDate(dateTo.getDate() - days)

  const dateFromISO = dateTo.toISOString()

  return { dateTo: dateToISO, dateFrom: dateFromISO }
}
