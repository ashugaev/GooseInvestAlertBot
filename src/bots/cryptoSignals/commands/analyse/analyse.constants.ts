import {
  SignalChat,
  SignalChatModel,
} from '@/bots/cryptoSignals/models/signalChat'
import { Pagination } from '@/components/pagination/pagination'

export const ANALYSE_SCENES = {
  init: 'analyze-scene-init',
}

export const channelsPagination = new Pagination({
  getItems: async () => {
    const channels = await SignalChatModel.find().lean()

    const items = channels.map((channel: SignalChat) => ({
      id: channel.chatId,
      title: channel.title,
    }))

    return items
  },
  itemsPerPage: 50,
  title: '👇 Отправь номер канала',
})
