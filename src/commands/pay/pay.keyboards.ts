import { TARIFFS } from './pay.constants'

export const payPricesKeyboard = [...TARIFFS.map(tariff => ([{
  text: tariff.buttonText,
  callback_data: tariff.price
}]))]
