import { log } from "../../helpers/log";
import { getAllInstruments } from "../../marketApi";
import { clearInstrumentsList, putItemsToInstrumentsList } from "../../models";

/**
 * Обновляет список доступных инструментов в базе
 */
export const instrumentsListUpdater = async () => {
    try {
        const instruments = await getAllInstruments();

        if(!instruments.length) {
            throw new Error('Ошибка получения списка инструментов');
        }

        await clearInstrumentsList();

        await putItemsToInstrumentsList(instruments);

        log.info('Список доступных инструментов в базе был обновлен', instruments.length);
    } catch (e) {
        log.error('Ошибка обновления списка инcтрументов', e)
    }
}
