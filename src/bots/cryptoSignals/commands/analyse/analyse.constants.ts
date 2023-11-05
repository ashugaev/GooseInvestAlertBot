import {
  getChatsWithConifg,
  SignalChat,
} from '@/bots/cryptoSignals/models/signalChat'
import { Pagination } from '@/components/pagination/pagination'

export const ANALYSE_SCENES = {
  init: 'analyze-scene-init',
}

export const channelsPagination = new Pagination({
  getItems: async () => {
    return (await getChatsWithConifg()).map((channel: SignalChat) => ({
      id: channel.chatId,
      title: channel.title,
    }))
  },
  itemsPerPage: 25,
  title: '👇 Отправь номер канала',
})
