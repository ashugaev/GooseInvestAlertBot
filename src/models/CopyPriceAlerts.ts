import { getModelForClass } from '@typegoose/typegoose';

import { PriceAlert } from './PriceAlert';

export class CopyPriceAlert extends PriceAlert {}

const CopyPriceAlertModel = getModelForClass(CopyPriceAlert);

export async function clearCopyPriceAlerts () {
  try {
    await CopyPriceAlertModel.deleteMany({});
  } catch (e) {
    throw new Error(e);
  }
}

export async function putItemsToCopyPriceAlerts (items: PriceAlert[]) {
  try {
    await CopyPriceAlertModel.insertMany(items);
  } catch (e) {
    throw new Error(e);
  }
}
