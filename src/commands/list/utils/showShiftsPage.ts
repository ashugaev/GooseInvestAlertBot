import { listConfig } from '../../../config'
import { EKeyboardModes } from '../keyboards/instrumentPageKeyboard'
import { getShiftTimeframesObject, TimeShift } from '../../../models'
import { getAlertNumberByPage } from './showInstrumentPage'
const { set } = require('lodash')

interface IShowShiftsPageParams {
  keyboardMode?: EKeyboardModes
  page: number
  ctx: any
  shiftsList: TimeShift[]
  edit?: boolean
}

export const showShiftsPage = async ({
  page,
  ctx,
  shiftsList,
  edit,
  keyboardMode
}: IShowShiftsPageParams) => {
  const itemsToShow = shiftsList
  // Сортировка по тикеру
  // @ts-expect-error
    .sort((a, b) => a.ticker > b.ticker)
    .slice(page * listConfig.itemsPerPage, (page + 1) * listConfig.itemsPerPage)

  let timeframesObj = ctx.wizard?.state?.shiftsList?.timeframesObj

  if (!timeframesObj) {
    timeframesObj = await getShiftTimeframesObject()

    set(ctx, 'wizard.state.shiftsList.timeframesObj', timeframesObj)
  }

  const itemsList = itemsToShow
  // Сортировка по цене
    .map(({ ticker, percent, growAlerts, fallAlerts, timeframe }, i) => {
      return ctx.i18n.t('alertsList_shifts_listItem', {
        // Номер элемента с учетом страницы
        number: getAlertNumberByPage({ i, page }),
        name: 'Kek',
        ticker,
        growthOnly: growAlerts && !fallAlerts,
        fallOnly: fallAlerts && !growAlerts,
        change: fallAlerts && growAlerts,
        percent,
        time: timeframesObj[timeframe]
      })
    }).join('\n')

  const message = ctx.i18n.t('alertsList_shifts_list', {
    list: itemsList,
    showEditMessage: keyboardMode === EKeyboardModes.edit
  })

  ctx[edit ? 'editMessageText' : 'replyWithHTML'](message, {
    parse_mode: 'HTML',
    disable_web_page_preview: true
    // FIXME: Доделать
    // reply_markup: {
    //   ...instrumentPageKeyboard(ctx, {
    //     page,
    //     itemsLength: instrumentItems.length,
    //     itemsToShowLength: itemsToShow.length,
    //     symbol,
    //     withoutBackButton: false,
    //     keyboardMode
    //   })
    // }
  })
}
