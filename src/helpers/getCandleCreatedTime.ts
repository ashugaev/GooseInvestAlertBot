export const roundTime = (time, roundTo) => {
  return Math.floor(time / roundTo) * roundTo
}

const getLastMonday = () => {
  const date = new Date()
  const today = date.getDate()
  const dayOfTheWeek = date.getDay()
  const newDate = date.setDate(today - (dayOfTheWeek === 0 ? 6 : dayOfTheWeek - 1))
  const resultTime = new Date(newDate).getTime()
  const roundedToDayResultTime = roundTime(resultTime, 86400000)

  return roundedToDayResultTime
}

const getFirstDayOfMonth = () => {
  const date = new Date()
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getTime()

  return firstDay
}

/**
 * Время создания последней актуальной свечи
 *
 * Округляет текущее время до lifetime
 * В результате получаем время старта свечи
 */
export const getCandleCreatedTime = ({ timeframe, lifetime }) => {
  const currentTime = new Date().getTime()

  let time

  switch (timeframe) {
    case '1W':
      time = getLastMonday()
      break

    case '1M':
      time = getFirstDayOfMonth()
      break

    default:
      time = roundTime(currentTime, lifetime)
  }

  return time
}
