
import { log } from '../../../helpers/log';
import { wait } from '../../../helpers/wait';
import { EMarketInstrumentTypes, InstrumentsList } from '../../../models';
import { EMarketDataSources } from '../../types';
import { binance } from '../utils/binance';

export interface BinanceSourceSpecificData {
  status: string
  baseAsset: string
  quoteAsset: string
  quote: string
  quotePrecision: number
  quoteAssetPrecision: number
  baseCommissionPrecision: 8
  quoteCommissionPrecision: 8
}

export interface BinanceTicker extends BinanceSourceSpecificData {
  symbol: string
}

const normalizeItem = (item: BinanceTicker): InstrumentsList => {
  const { symbol, ...specificData } = item;

  const result = {
    id: `binance_${symbol}`,
    source: EMarketDataSources.binance,
    name: symbol,
    ticker: symbol,
    type: EMarketInstrumentTypes.Crypto,
    sourceSpecificData: specificData
  };

  return result;
};

export const binanceGetAllInstruments = async () => {
  try {
    const data = await binance.exchangeInfo();

    const symbols: BinanceTicker[] = data.symbols;

    const normalizedInstrumentsArray = symbols.map(normalizeItem);

    return normalizedInstrumentsArray;
  } catch (e) {
    log.error('Ошибка получения списка инструментов binance:', e);

    await wait(30000);

    // Ретрай
    return binanceGetAllInstruments();
  }
};
