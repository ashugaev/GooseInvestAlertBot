const CoinGecko = require('coingecko-api')

const finnhub = require('finnhub');

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = "kek"

const finnhubClient = new finnhub.DefaultApi()

const CoinGeckoClient = new CoinGecko();

(async function () {
    let list = null
    list = await CoinGeckoClient.coins.list();

    // console.log('list', list.data);

    const ids =  list.data.slice(0, 400).map(el => el.id.toString());

    /**
     * По итогу это самый оптимальный вариант что бы мониторить цену и объемы
     */
    let prices = null
    prices = await CoinGeckoClient.simple.price({
        // Примерно 400 монет можно обновлять за раз
        // Ограничение это вместимость гет запроса
        // ids,
        ids: 'bitcoin',
        vs_currencies: true,
        include_market_cap: true,
        include_24hr_vol: true,
        include_24hr_change: true,
        include_last_updated_at: true
    })

    console.log('result', prices);

    const marketData = await CoinGeckoClient.coins.fetchMarketChart('bitcoin', {
        vs_currency: 'usd',
        days: 2,
        interval: 'hourly'
    })

    // console.log('length', marketData.data.total_volumes.length, 'market data', marketData.data)


    // Stock candles
   // finnhubClient.stockCandles("BINANCE:BTCUSDT", "60", 1583098857, 1584308457, (error, data, response) => {
   //      console.log('finhubCandled', data)
   //  });
})();
