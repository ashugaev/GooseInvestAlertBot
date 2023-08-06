export function timeoutPromise(promise, timeout) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout exceeded')), timeout)
  )

  return Promise.race([promise, timeoutPromise])
}
