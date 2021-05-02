import { coingeckoGetAllInstruments } from "./coingecko/api/getAllInstruments";
import { tinkoffGetAllInstruments } from "./tinkoff/api/getAllInstruments";
import { IBaseInstrumentData } from "./types";

const excludeInstrumentDuplicates = (items): IBaseInstrumentData[] => {
    const itemsObj = items.reduce((acc, item) => {
        acc[item.ticker] = item

        return acc;
    }, {})

    return Object.values(itemsObj);
}

/**
 * Получает список всех инструментов подключенных к боту
 */
export const getAllInstruments = async (): Promise<IBaseInstrumentData[]> => {
    const allInstrumentsPromises = [
        tinkoffGetAllInstruments(),
        coingeckoGetAllInstruments(),
    ]

    const allInstruments = await Promise.all(allInstrumentsPromises);

    return excludeInstrumentDuplicates(allInstruments);
}
