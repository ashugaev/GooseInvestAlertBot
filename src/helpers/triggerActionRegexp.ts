import { actionPayloadDelimiter } from './createActionString'

export const triggerActionRegexp = (actionName: string) => {
  // TODO: Make payload optional
  return new RegExp(`${actionName}${actionPayloadDelimiter}(.+)`)
}
