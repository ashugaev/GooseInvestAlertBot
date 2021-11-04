export interface CreateActionStringPayload {
  [key: string]: any
}

export const actionPayloadDelimiter = '--'

export const createActionString = (name: string, payload: CreateActionStringPayload): string => {
  const result = `${name}${actionPayloadDelimiter}${JSON.stringify(payload)}`

  if (result.length > 64) {
    throw new Error('[createActionString] Вышел за лимит экшена. Максимальная длина строки 64 символа')
  }

  return result
}
