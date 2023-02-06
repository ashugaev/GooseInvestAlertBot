import { Markup } from 'telegraf'

import { SHIFT_ACTIONS } from '@/commands/shift'
import { SOURCE_CONFIG } from '@/constants/sourceConfig'
import { createActionString } from '@/helpers'
import { EMarketDataSources } from '@/marketApi/types'

export const chooseSourceKeyboard = () => {
  const keys = []
  const sources = Object.keys(EMarketDataSources)

  while (sources.length) {
    const firstRowElement = sources.shift()
    const secondRowElement = sources.shift()

    const row = []

    if (firstRowElement) {
      row.push(Markup.callbackButton(
        SOURCE_CONFIG[firstRowElement].fullName,
        createActionString(SHIFT_ACTIONS.chooseSource, { source: firstRowElement })
      ))
    }

    if (secondRowElement) {
      row.push(
        Markup.callbackButton(
          SOURCE_CONFIG[secondRowElement].fullName,
          createActionString(SHIFT_ACTIONS.chooseSource, { source: secondRowElement })
        )
      )
    }

    keys.push(row)
  }

  const keyboard = Markup.inlineKeyboard(keys)

  return keyboard
}
