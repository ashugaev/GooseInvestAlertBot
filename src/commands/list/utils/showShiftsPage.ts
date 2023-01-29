import { listConfig } from '../../../config'
import { Actions } from '../../../constants'
import { TimeShift } from '../../../models'
import { EKeyboardModes, instrumentPageKeyboard } from '../keyboards/instrumentPageKeyboard'
import { EListTypes, ListActionsDataKeys } from '../list.types'
import { getTimeframesObjFromStoreOrDB } from './getTimeframesObjFromStoreOrDB'
import { getAlertNumberByPage } from './showInstrumentPage'

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

  const timeframesObj = await getTimeframesObjFromStoreOrDB(ctx)

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
    empty: !itemsList.length,
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
          action: Actions.list_shiftsPage,
          payloadCallback: (i) => {
            return {
              [ListActionsDataKeys.selectedAlertId]: itemsToShow[i]._id
            }
          }
        },
        editNumberButtonsConfig: {
          action: Actions.list_shiftEditPage,
          payload: {
            p: page
          },
          payloadCallback: (i) => {
            return {
              [ListActionsDataKeys.selectedAlertId]: itemsToShow[i]._id
            }
          }
        }
      })
    }
  })
}
