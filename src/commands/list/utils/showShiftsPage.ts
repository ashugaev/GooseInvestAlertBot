import { listConfig } from '../../../config'
import { EKeyboardModes, instrumentPageKeyboard } from '../keyboards/instrumentPageKeyboard'
import { getShiftTimeframesObject, TimeShift } from '../../../models'
import { getAlertNumberByPage } from './showInstrumentPage'
import { EListTypes } from '../list.types'
import { Actions } from '../../../constants'
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
  // Сортировка по названию
    .sort((a, b) => a.name > b.name ? 1 : -1)
    .slice(page * listConfig.itemsPerPage, (page + 1) * listConfig.itemsPerPage)

  let timeframesObj = ctx.wizard?.state?.shiftsList?.timeframesObj

  if (!timeframesObj) {
    timeframesObj = await getShiftTimeframesObject()

    set(ctx, 'wizard.state.shiftsList.timeframesObj', timeframesObj)
  }

  const itemsList = itemsToShow
    .map(({ ticker, percent, growAlerts, fallAlerts, timeframe, name }, i) => {
      return ctx.i18n.t('alertsList_shifts_listItem', {
        // Номер элемента с учетом страницы
        number: getAlertNumberByPage({ i, page }),
        name,
        ticker,
        growthOnly: growAlerts && !fallAlerts,
        fallOnly: fallAlerts && !growAlerts,
        change: fallAlerts && growAlerts,
        percent,
        time: timeframesObj[timeframe].name_ru_plur
      })
    }).join('\n')

  const message = ctx.i18n.t('alertsList_shifts_list', {
    list: itemsList,
    showEditMessage: keyboardMode === EKeyboardModes.edit
  })

  await ctx[edit ? 'editMessageText' : 'replyWithHTML'](message, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: {
      ...instrumentPageKeyboard(ctx, {
        page,
        itemsLength: shiftsList.length,
        itemsToShowLength: itemsToShow.length,
        withoutBackButton: true,
        keyboardMode,
        showAlertsTypeToggler: true,
        currentListType: EListTypes.shifts,
        paginationButtonsConfig: {
          action: Actions.list_shiftsPage,
          payload: {
            p: page,
            kMode: keyboardMode
          }
        },
        editButtonConfig: {
          action: Actions.list_shiftsPage
        },
        editNumberButtonsConfig: {
          action: Actions.list_shiftsPage,
          payload: {
            p: page,
            kMode: EKeyboardModes.edit
          }
        }
      })
    }
  })
}
