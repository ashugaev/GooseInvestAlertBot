import {getLastPrice, GetLastPriceData} from "./stocksApi";
import {getAlias} from "../models";
import {i18n} from "./i18n";

interface GetInstrumentDataBySymbolOrAliasData {
    symbol: string,
    aliasName: string,
    instrumentData: GetLastPriceData,
}

export function getInstrumentDataBySymbolOrAlias({symbol, user, ctx}) {
    return new Promise<GetInstrumentDataBySymbolOrAliasData>(async (rs, rj) => {
        let instrumentData = null;
        let aliasName = null;

        try {
            instrumentData = await getLastPrice(symbol);
        } catch (e) {
            // TODO: Класть алиаса сразу же в контекст. При создании нового, делать перезапрос и обновлять
            try {
                const [alias] = await getAlias({title: symbol, user});

                instrumentData = await getLastPrice(alias.symbol);

                aliasName = symbol;
                symbol = alias.symbol;
            } catch (e) {
                await ctx.replyWithHTML(
                    i18n.t('ru', 'alertErrorUnexistedSymbol', {symbol}),
                    {disable_web_page_preview: true}
                )

                rj(e);

                return;
            }
        }

        rs({instrumentData, symbol, aliasName});
    })
}
