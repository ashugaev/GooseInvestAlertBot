/**
 * Маленькие чистые помощники для усмирения шумных логов.
 *
 * Используются там, где «событие» повторяется каждый цикл, а полезен либо
 * редкий heartbeat, либо только сам факт изменения состояния.
 */

/**
 * Возвращает функцию-предикат: `true` не чаще, чем раз в `intervalMs`
 * (для каждого ключа отдельно). Если ключ не задан — общий счётчик.
 *
 * Пример: log liveness раз в минуту на источник цен.
 */
export const createOncePerInterval = (intervalMs: number) => {
  const lastAt: Record<string, number> = {}
  return (key = '_default'): boolean => {
    const now = Date.now()
    if (!lastAt[key] || now - lastAt[key] >= intervalMs) {
      lastAt[key] = now
      return true
    }
    return false
  }
}

/**
 * Возвращает функцию-предикат: `true` только когда переданный ключ
 * (например, отсортированный список «отсутствующих тикеров») отличается
 * от прошлого вызова.
 */
export const createDedupByKey = () => {
  let lastKey = ''
  return (key: string): boolean => {
    if (key === lastKey) return false
    lastKey = key
    return true
  }
}
