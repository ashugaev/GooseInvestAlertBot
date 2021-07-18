import { Actions } from '../constants'
import { actionPayloadDelimiter } from './createActionString'

export const triggerActionRegexp = (actionName: Actions) => {
  // TODO: Сделать payload необязательным
  return new RegExp(`${actionName}${actionPayloadDelimiter}(.+)`)
}
