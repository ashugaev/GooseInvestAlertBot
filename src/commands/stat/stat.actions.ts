import { removeShiftById } from '../../models'

export const shiftDeleteActions = async (ctx) => {
  const {
    id
  } = JSON.parse(ctx.match[1])

  removeShiftById(id)

  ctx.deleteMessage()
}
