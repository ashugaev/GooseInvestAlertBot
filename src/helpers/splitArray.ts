/**
 * Split array by chunks
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const splitArray = (arr: any[], chunkLength: number) => {
  const chunksCount = Math.ceil(arr.length / chunkLength)
  const chunks = []

  for (let i = 0; i < chunksCount; i++) {
    chunks.push(arr.splice(0, chunkLength))
  }

  return chunks
}
