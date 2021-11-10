import { actionPayloadDelimiter } from './createActionString'

export const triggerActionRegexp = (actionName: string) => {
  // TODO: Сделать payload необязательным
  return new RegExp(`${actionName}${actionPayloadDelimiter}(.+)`)
}
