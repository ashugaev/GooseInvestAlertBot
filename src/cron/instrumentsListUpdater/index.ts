import { log } from '../../helpers/log'
import { getAllInstruments } from '../../marketApi'
import { clearInstrumentsList, InstrumentsListModel, putItemsToInstrumentsList } from '../../models'
import { wait } from '../../helpers/wait'

/**
 * Обновляет список доступных инструментов в базе
 */
export const instrumentsListUpdater = async () => {
  try {
    const newInstrumentsList = await getAllInstruments()

    if (!newInstrumentsList.length) {
      throw new Error('Ошибка получения списка инструментов')
    }

    // TODO: Делать очищение с обновлением одной командой
    //  Что бы падение было сразе двух команд и никак не после удаления
    await clearInstrumentsList()

    await putItemsToInstrumentsList(newInstrumentsList)
    log.info('Instrument list updated')

    log.info('Список доступных инструментов в базе был обновлен', newInstrumentsList.length)
  } catch (e) {
    try {
      log.error('Ошибка обновления списка инcтрументов', e)
      log.error('Retrying')

      await wait(60000)
      await instrumentsListUpdater()
    } catch (e) {
      log.error('Ошибка обновления списка инcтрументов', e)
    }
  }
}
