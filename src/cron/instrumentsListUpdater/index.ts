import { log } from '../../helpers/log'
import { getAllInstruments } from '../../marketApi'
import { clearInstrumentsList, InstrumentsListModel, putItemsToInstrumentsList } from '../../models'

/**
 * Обновляет список доступных инструментов в базе
 */
export const instrumentsListUpdater = async () => {
  try {
    const newInstrumentsList = await getAllInstruments()
    const oldInstrumentsList = await InstrumentsListModel.find({}).lean()

    if (!newInstrumentsList.length) {
      throw new Error('Ошибка получения списка инструментов')
    }

    // TODO: Делать очищение с обновлением одной командой
    //  Что бы падение было сразе двух команд и никак не после удаления
    await clearInstrumentsList()

    try {
      await putItemsToInstrumentsList(newInstrumentsList)
    } catch (e) {
      log.error('Ошибка обновления списка инcтрументов', e)

      // Если с новыми что-то не так, вернем старые
      await putItemsToInstrumentsList(oldInstrumentsList)
    }

    log.info('Список доступных инструментов в базе был обновлен', newInstrumentsList.length)
  } catch (e) {
    log.error('Ошибка обновления списка инcтрументов', e)
  }
}
