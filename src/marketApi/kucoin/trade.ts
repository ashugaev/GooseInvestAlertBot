import {KucoinAPI} from "@/marketApi/kucoin/index"
require('dotenv').config()

export interface TradeWithKucoinParams {
    side: 'buy' | 'sell',
    amount: number,
    stopSellPrice: number,
    stopBuyPrice: number,
    symbol: string,
}

export interface KucoinOrderParams {
    clientOid: string,
    symbol: string,
    side: 'buy' | 'sell',
    type: 'limit' | 'market',
    remark: string,
    stp?: 'CN' | 'CO' | 'CB' | 'DC'
    tradeType: 'TRADE' | 'MARGIN_TRADE',
    // UDT in BTCUSDT
    funds?: number
    // BTC in BTCUSDT
    size?: number
}

export const tradeWithKucoin = async ({
  side,
  symbol,
  remark,
  funds,
  size,
}: Partial<KucoinOrderParams>) => {
  const orderParams: KucoinOrderParams = {
    clientOid: Date.now().toString(),
    side,
    symbol,
    type: 'market',
    // Max 100
    remark: remark.slice(0, 90),
    tradeType: 'TRADE',
    funds, // USDT
    size,
  }

  return await KucoinAPI.rest.Trade.Orders.postOrder(orderParams)
}