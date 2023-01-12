/**
 * Calculates execution time
 */
import { log } from './log'

export const fnTime = (fn: () => any, logText: string) => {
  const startTime = new Date().getTime()

  const res = fn()

  log.info(logText, '. Time: ', ((new Date().getTime() - startTime) / 1000).toString() + 's')

  return res
}

export const fnTimeAsync = async (fn: () => Promise<any>, logText: string) => {
  const startTime = new Date().getTime()

  const res = await fn()

  const secondsPast = (new Date().getTime() - startTime) / 1000

  if (secondsPast > 0.1) {
    log.info(logText, '. Time: ', secondsPast.toString() + 's')
  }

  return res
}
