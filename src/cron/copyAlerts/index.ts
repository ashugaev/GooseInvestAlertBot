import { log } from '../../helpers/log';
import {
  clearCopyPriceAlerts,
  getAllAlerts,
  putItemsToCopyPriceAlerts
} from '../../models';

/**
 * Копирует все алерты в отдельную коллекцию
 */
export const copyAlerts = async () => {
  try {
    const alerts = await getAllAlerts();

    if (!alerts.length) {
      log.info('Нет алертов для резервной копии');
      return;
    }

    await clearCopyPriceAlerts();

    await putItemsToCopyPriceAlerts(alerts);

    log.info('Алерты были сохранены в резервную коллекцию', alerts.length, 'шт');
  } catch (e) {
    log.error('Ошибка сохранения копии алертов', e);
  }
};
