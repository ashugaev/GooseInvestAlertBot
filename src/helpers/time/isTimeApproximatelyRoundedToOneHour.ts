export function isApproximatelyRoundedToHour(time: Date, accuracyInSeconds: number): boolean {
  const seconds = time.getSeconds()
  const roundedSeconds = Math.round(seconds / accuracyInSeconds) * accuracyInSeconds

  return roundedSeconds === 0 || (time.getMinutes() === 59 && roundedSeconds === 60)
}
