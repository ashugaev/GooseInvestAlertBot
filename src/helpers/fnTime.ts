/**
 * Calculates execution time
 */
import { log } from './log'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fnTimeAsync = async (fn: () => Promise<any>, logText: string) => {
  const startTime = new Date().getTime()

  const res = await fn()

  const secondsPast = (new Date().getTime() - startTime) / 1000

  if (secondsPast > 1) {
    log.info(logText, '. Time: ', secondsPast.toString() + 's')
  }

  return res
}
