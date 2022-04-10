/**
 * Split array by chunks
 */
export const splitArray = (arr, chunkLength) => {
  const chunksCount = Math.ceil(arr.length / chunkLength);
  const chunks = [];

  for (let i = 0; i < chunksCount; i++) {
    chunks.push(arr.splice(0, chunkLength));
  }

  return chunks;
};
