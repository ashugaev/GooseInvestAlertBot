import {ADDCHAT_SCENE} from "@/commands/addChat/addChat.constants"
import {i18n} from "@/helpers/i18n"
import {addNewEventHandler} from "@/integrations/telegram/setupEventHandlers"
import { TrackChatModel} from "@/models/TrackChat"
import {immediateStep, waitMessageStep} from '@/scenes/wrappers'


const WizardScene = require('telegraf/scenes/wizard')

/**
 * Handle: -
 * Ask: Chat identifier
 * 
 * @todo: add validation
 * */
const askChat = immediateStep('send token', async (ctx) => {
  await ctx.replyWithHTML(i18n.t('ru', 'addChat_enterChatId'))
    
  return ctx.wizard.next()
})

/**
 * Handle: Chat identifier
 * Final: Add result
 */
const handleChatId = waitMessageStep(
  'chat_id_handle',
  async (ctx, message, state) => {
    const username = ctx.message.text
      
    await TrackChatModel.insertMany({
      username,
      // FIXME: Hardcoded for now
      purpose: 'pump'
    })
    await ctx.replyWithHTML(i18n.t('ru', 'addChat_success', {
      // FIXME: Hardcoded for now
      channel: true, 
      // TODO: Show title here
      title: username
    }))

    await addNewEventHandler(username)
      
    return ctx.scene.leave()
  })

export const addChatScenes = new WizardScene(ADDCHAT_SCENE,
  askChat,
  handleChatId
)
