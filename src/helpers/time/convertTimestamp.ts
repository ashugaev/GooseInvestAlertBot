export function convertTimestampToLocalDate(timestamp: number): Date | null {
  if (!timestamp) {
    return null
  }
  return new Date(timestamp)
}
