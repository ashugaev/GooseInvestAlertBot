import {TrackChatCallbacksParams} from "@/models/TrackChat"

export const handleMessage = (params: TrackChatCallbacksParams) => {
  console.log('handleMessage', params)
}