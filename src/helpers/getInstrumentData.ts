import { EMarketDataSources, IBaseInstrumentData } from "../marketApi/types";
import { getInstrumentInfoByTicker } from "../models";
import { i18n } from "./i18n";
import { getLastPrice } from "./stocksApi";

interface GetInstrumentDataBySymbolOrAliasData {
    price: number,
    instrumentData: IBaseInstrumentData,
}

interface IGetInstrumentDataWithPrice {
    symbol: string,
    ctx?: any,
}

export async function getInstrumentDataWithPrice({
                                                     symbol,
                                                     ctx
}: IGetInstrumentDataWithPrice): Promise<GetInstrumentDataBySymbolOrAliasData> {
    symbol = symbol.toUpperCase();

    try {
        const ticker = [symbol];
        let customCurrency;

        // TODO: Брать символы из symbols объекта
        const tickerWithCurrency = symbol.match(/^(.+)(usd|eur|rub)$/i);

        // Если тикер содержит в себе валютную пару, то попробуем искать без нее (для крипты)
        if (tickerWithCurrency) {
            customCurrency = tickerWithCurrency[2].toUpperCase();
            // Добавить в список для поиска крипту без валютной пары
            ticker.push(tickerWithCurrency[1]);
        }

        const instrumentDataArr = await getInstrumentInfoByTicker({ ticker });

        if (!instrumentDataArr.length) {
            if (ctx){
                await ctx.replyWithHTML(
                    i18n.t('ru', 'alertErrorUnexistedSymbol', { symbol }),
                    { disable_web_page_preview: true }
                )
            }

            return;
        }

        const instrumentDataItem = instrumentDataArr[0];

        if (instrumentDataItem.source === EMarketDataSources.coingecko) {
            // Подсовываем валюту, если не была указана пара
            // @ts-ignore
            instrumentDataItem.sourceSpecificData.currency = customCurrency ?? 'USD'
        }

        const lastPrice = await getLastPrice({ instrumentData: instrumentDataItem });

        return { instrumentData: instrumentDataItem, price: lastPrice };
    } catch (e) {
        throw new Error(e);
    }
}
