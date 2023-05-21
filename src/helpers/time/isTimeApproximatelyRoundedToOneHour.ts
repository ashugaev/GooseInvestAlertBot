export function isApproximatelyRoundedToHour(time: Date, accuracyInSeconds: number): boolean {
  const seconds = time.getSeconds()
  const minutes = time.getMinutes()
  const totalSeconds = minutes * 60 + seconds
  const oneHourInSeconds = 60 * 60

  return ((oneHourInSeconds - totalSeconds) <= accuracyInSeconds) || (totalSeconds <= accuracyInSeconds)
}
