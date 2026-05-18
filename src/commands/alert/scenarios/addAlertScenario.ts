import { log } from '@/helpers'

import { i18n } from '../../../helpers/i18n'
import { getInstrumentInfoByTicker } from '../../../models'
import { COMMON_SCENES } from '../../../scenes/scenes.constants'
import { ALERT_SCENES } from '../alert.constants'
import { AddAlertPayload } from '../alert.types'
import { attachMessageToAlert } from '../utils/attachMessageToAlert'
import { createAlertInDb } from '../utils/createAlertInDb'

const logPrefix = '[ADD ALERT SCENARIO]'

/**
 * Add alert function.
 * If input data is insufficient, it requests it from the user.
 *
 * TODO: Could build a utility that runs ifs sequentially.
 *  Under the hood it could be a generator.
 *
 * TODO: Decouple validation from data fetching, then we can feed in
 *  plain data without requesting it as a separate step.
 */
export function addAlertScenario(ctx, payload: AddAlertPayload) {
  // State held in closure, preserved across nextStep calls
  let state: AddAlertPayload = payload

  ;(function nextStep(payloadUpdate) {
    state = { ...state, ...payloadUpdate }

    const {
      prices,
      ticker,
      instrumentsList,
      message,
      alertCreated,
      messageAttached,
      currentPrice,
      createdItemsList,
    } = state

    /**
     * Step 1
     * - No ticker
     *
     * Ask user ticker and save it in context
     */
    if (!ticker) {
      ctx.scene.enter(ALERT_SCENES.askTicker, {
        payload: {},
        callback: nextStep,
      })

      return
    }

    /**
     * Step 2
     * - Have ticker
     * - No ticker data from db
     *
     * Find ticker in DB and save results in context
     */
    if (ticker && !instrumentsList?.length) {
      ;(async () => {
        try {
          const instrumentsList = await getInstrumentInfoByTicker({
            ticker: [ticker, ticker + 'USDT'],
          })

          if (!instrumentsList.length) {
            await ctx.replyWithHTML(
              i18n.t('ru', 'alertErrorUnexistedSymbol', { symbol: ticker }),
              { disable_web_page_preview: true }
            )

            return
          }

          nextStep({ instrumentsList })
        } catch (e) {
          log.error(logPrefix, 'add alert scenario crash 1', e)
          await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
        }
      })().catch(async (e) => {
        await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
        log.error(logPrefix, 'add alert scenario crash', e)
      })

      return
    }

    // Offer to pick a coin when several match the ticker
    if (instrumentsList?.length > 1) {
      ctx.scene.enter(COMMON_SCENES.tickerDuplicates, {
        payload: { instrumentsList },
        callback: nextStep,
      })

      return
    }

    /**
     * Ask for the price if it is not provided
     */
    if (!prices && instrumentsList.length === 1 && ticker) {
      ctx.scene.enter(ALERT_SCENES.askPrice, {
        payload: { instrumentsList },
        callback: nextStep,
      })

      return
    }

    // Once the main data is collected
    if (
      prices?.length &&
      instrumentsList?.length === 1 &&
      currentPrice &&
      !alertCreated
    ) {
      // FIXME: need await?
      createAlertInDb({
        ctx,
        payload: { instrumentsList, prices, currentPrice },
        callback: (arg) => {
          state.alertCreated = true
          nextStep(arg)
        },
      }).catch(async (e) => {
        await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
        log.error(logPrefix, 'create alert in DB crash', e)
      })

      return
    }

    // If the user has not provided a message
    if (!message && createdItemsList?.length === 1) {
      ctx.scene.enter(ALERT_SCENES.askMessage, {
        payload: { createdItemsList },
        callback: nextStep,
      })

      return
    }

    // If a message exists but has not been saved to DB
    if (!messageAttached && message) {
      const _id = createdItemsList[0]._id

      attachMessageToAlert(ctx, { message, _id }, (arg) => {
        state.messageAttached = true
        nextStep(arg)
      }).catch(async (e) => {
        await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
        log.error(logPrefix, 'attach message crash', e)
      })
    }
  })()
}
