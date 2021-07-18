interface CreateActionStringPayload {
    [key: string]: any
}

export const actionPayloadDelimiter = '--'

export const createActionString = (name: string, payload: CreateActionStringPayload): string => {
  return `${name}${actionPayloadDelimiter}${JSON.stringify(payload)}`
}
