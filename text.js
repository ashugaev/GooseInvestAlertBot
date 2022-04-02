const CoinGecko = require('coingecko-api');

const CoinGeckoClient = new CoinGecko();

(async () => {
    await CoinGeckoClient.ping()

    const result = await CoinGeckoClient.coins.list();

    console.log('res', result)
})();
