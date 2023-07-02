import { TrackChatCallbacksParams } from '@/models/TrackChat'

export const handleDevochkiChannelMessage = async (
  data: TrackChatCallbacksParams
) => {
  // Manual validation
  // Detect message type
  // Type 1: Signal
  // Type 2: Move stop
  // Chat GPT validation
  // Validation of chat GPT answer
  // Смотрим что уже нет активной сделки по этому тикеру
  // Make orders
  // Ожидание закрепления. Отправим с определнным статусом джобу в очередь
}
