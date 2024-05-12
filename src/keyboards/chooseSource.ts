import { Markup } from 'telegraf'

import { SOURCE_CONFIG } from '@/constants/sourceConfig'
import { createActionString } from '@/helpers'
import { EMarketDataSources } from '@/marketApi/types'

export const chooseSourceKeyboard = (
  action: string,
  filterBy?: EMarketDataSources[]
) => {
  const keys = []
  const sources = Object.keys(EMarketDataSources).filter(
    (source: EMarketDataSources) => {
      if (filterBy) {
        return filterBy.includes(source)
      }
      return true
    }
  )

  while (sources.length) {
    const firstRowElement = sources.shift()
    const secondRowElement = sources.shift()

    const row = []

    if (firstRowElement) {
      row.push(
        Markup.callbackButton(
          SOURCE_CONFIG[firstRowElement].fullName,
          createActionString(action, {
            source: firstRowElement,
          })
        )
      )
    }

    if (secondRowElement) {
      row.push(
        Markup.callbackButton(
          SOURCE_CONFIG[secondRowElement].fullName,
          createActionString(action, {
            source: secondRowElement,
          })
        )
      )
    }

    keys.push(row)
  }

  const keyboard = Markup.inlineKeyboard(keys)

  return keyboard
}
