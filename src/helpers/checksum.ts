/**
 * Герерирует уникальный хэш для строки
 */
export function checksum (s) {
  let chk = 0x12345678
  const len = s.length
  for (let i = 0; i < len; i++) {
    chk += (s.charCodeAt(i) * (i + 1))
  }

  return (chk & 0xffffffff).toString(16)
}
