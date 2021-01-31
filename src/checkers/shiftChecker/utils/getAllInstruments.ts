import {stocksApi} from "../../../helpers/stocksApi";
import {log} from "../../../helpers/log";
import {wait} from "../../../helpers/wait";

export const getAllInstruments = () => new Promise<any[]>(async (rs) => {
    try {
        const allInstrumentsPromises = [
            stocksApi.stocks(),
            stocksApi.etfs(),
            stocksApi.bonds()
        ]

        const allInstruments:any[] = await Promise.all(allInstrumentsPromises);

        rs(allInstruments)
    } catch (e) {
        log.error('Ошибка получения списка иструментов:', e)

        await wait(30000);

        rs(await getAllInstruments());
    }
})
