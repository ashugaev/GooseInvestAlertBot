/** Проверятель бинанса
    Список монет бинанса добавится к общему, чекер будет отдельный
    Раз в 2 секунды будет просходить плучение цен
    Чекер будет вытягивать алерты из базы по определенному признаку (source или тип того)
    Соответственно у других чекеров этот источник должен быть в исключениях
*/

/**
 * Алгоритм проверки
 *
 * Итератор крутится с циклом в 2 секунды.
 * Получает на каждой итерации алерты.
 * Делает проверку цен по ним.
 * Шлет оповещеньки.
 */

import { wait } from '../../helpers/wait'
import { binance } from '../../marketApi/binance/utils/binance'
import { getUniqSymbols } from '../../models'

/**
 * Чекер цены чисто для бинанса, подстроенный под его особенности
 */

export const setupBinancePriceChecker = async () => {
  while (true) {
    await wait(1500)

    const symbols = await getUniqSymbols(50)

    // Актуальные цены
    // TODO: Вынести в утилиту getBinanceLastPrice, которая будет ходить в кэш утилиты getAllBinancePrices
    // getBinanceCoinLastPrice

    // const
  }
}
