import { logPrefix } from '@/features/pumpDetect/pumpDetect.constants'

export function isApproximatelyRoundedToHour(
  time: Date,
  accuracyInSeconds: number
): boolean {
  const seconds = time.getSeconds()
  const minutes = time.getMinutes()
  const totalSeconds = minutes * 60 + seconds
  const oneHourInSeconds = 60 * 60

  console.info(
    logPrefix,
    'isApproximatelyRoundedToHour',
    'Minutes:',
    minutes,
    'Seconds:',
    seconds,
    'Total seconds:',
    totalSeconds
  )

  return (
    oneHourInSeconds - totalSeconds <= accuracyInSeconds ||
    totalSeconds <= accuracyInSeconds
  )
}
