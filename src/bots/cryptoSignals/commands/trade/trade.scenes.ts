import { TRADE_SCENE } from '@/bots/cryptoSignals/commands/trade/trade.constants'
import { AskByModel } from '@/components/askByModel/askByModel'
import { i18n } from '@/helpers/i18n'
import { addNewEventHandler } from '@/integrations/telegram/setupEventHandlers'
import { EMarketDataSources } from '@/marketApi/types'
import { TradeByChat, TradeByChatModel } from '@/models/TrackChat'
import { immediateStep, waitMessageStep } from '@/scenes/wrappers'

const WizardScene = require('telegraf/scenes/wizard')

export const askNewTradeChat = new AskByModel<typeof TradeByChat>(
  TradeByChatModel,
  {
    chat: {
      // @ts-ignore
      type: 'oneOf',
      required: true,
      default: 'kek',
    },
  },
  {
    // sceneName: TRADE_SCENE,
    // askFields: ['kek'],
    // successMessage: 'kek',
    // successHandler: async (ctx, state) => {
    //   await ctx.replyWithHTML(i18n.t('ru', 'addChat_success'))
    // },
  }
)

/**
 * Handle: -
 * Ask: Chat identifier
 *
 * @todo: add validation
 * */
export const askChat = immediateStep('send token', async (ctx) => {
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

    await TradeByChatModel.insertMany({
      username,
      // FIXME: Hardcoded for now
      purpose: 'pump',
      // FIXME: Hardcoded for now
      targetSource: EMarketDataSources.kucoin,
    })
    await ctx.replyWithHTML(
      i18n.t('ru', 'addChat_success', {
        // FIXME: Hardcoded for now
        channel: true,
        // TODO: Show title here
        title: username,
      })
    )

    await addNewEventHandler(username)

    return ctx.scene.leave()
  }
)

export const tradeScenes = new WizardScene(TRADE_SCENE, askChat, handleChatId)
