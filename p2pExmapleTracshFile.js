// FIXME: KILL or change path

const https = require("https");
const axios = require("axios");

// Репа с примером
// https://github.com/sanchezmarcos/binancio/
function fetchP2PData(
    page = 1,
    fiat = "CNY",
    tradeType = "BUY",
    asset = "BTC",
    payTypes = [],
    rows = 100,
    // merchant | null
    publisherType = 'merchant',
    countries = []
) {
    return new Promise((resolve, reject) => {
        const baseObj = {
            page,
            rows: 20,
            publisherType: null,
            asset,
            tradeType,
            fiat,
            payTypes,
            rows
        };

        const stringData = JSON.stringify(baseObj);
        const options = {
            hostname: "p2p.binance.com",
            port: 443,
            path: "/bapi/c2c/v2/friendly/c2c/adv/search",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": stringData.length,
            },
        };

        const req = https.request(options, (res) => {
            let output = "";
            res.on("data", (d) => {
                output += d;
            });

            res.on("end", () => {
                try {
                    const jsonOuput = JSON.parse(output);
                    resolve(jsonOuput);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on("error", (error) => {
            reject(error);
        });

        req.write(stringData);
        req.end();
    });
}

(async () => {
    const {data} = await fetchP2PData();

    console.log('data', data, data.length)
})();

/*

module.exports = fetchP2PData;

(async () => {
    const timeStart = new Date().getTime();

    for(let i = 0; i < 1000; i++) {
        try {
            await Promise.all([
                fetchP2PData(),
                fetchP2PData(),
                fetchP2PData(),
                fetchP2PData(),
                fetchP2PData()
            ]) ;

            console.log('requests', i * 5, 'time', (new Date().getTime() - timeStart)/1000, 'sec')
        } catch (e) {
            console.error('end', e);
            break;
        }
    }
})()
 */


// (async () => {
//     try {
//         const {data: {results}} = await axios.get('https://free.currconv.com/api/v7/currencies?apiKey=f');
//         console.log('data', results)
//     } catch (e) {
//         console.error(e)
//     }
//     const keys = Object.keys(results);
//
//     console.log('keys', keys.length);
//
//     // const q = [].concat(...keys.map(base => keys.map(sec => sec + '_' + base)));
//     //
//     // // console.log(q)
//     //
//     // try {
//     // const {data} = await axios.get(`https://free.currconv.com/api/v7/convert?q=${q.slice(0, 2).join(',')}&compact=ultra&apiKey=`);
//     // console.log('data', data);
//     // } catch (e) {
//     //     console.log(e)
//     // }
//
// })()

// (async () => {
//     // import yahooFinance from 'yahoo-finance2';
//
//     // // require syntax (if your code base does not support imports)
//     //  const yahooFinance = require('yahoo-finance2').default; // NOTE the .default
//     //
//     //  // const result1s = await yahooFinance.search('AAPL');
//     //  const results1 = await yahooFinance.search('EURUSD');
//     //
//     //  console.log('res', results)
//
//     const {data: {quoteResponse: {result: data}}} = await axios('https://query1.finance.yahoo.com/v7/finance/quote?region=US&lang=en&symbols=USDRUB=X,EURRUB=X,JPYRUB=X,EURUSD=X,JPYUSD=X');
//
//     // const {data: {chart: {result: data2}}} = await axios('https://query1.finance.yahoo.com/v8/finance/chart/USDRUB=X?interval=1m',);
//
//     // console.log(data2[0]);
//     // console.log(data2[0].indicators.quote[0].close);
//     console.log(data.map(el => el.shortName + ':' + el.regularMarketPrice).join(' | '));
//
//     console.log('calculated', 'EURUSD', data[1].regularMarketPrice / data[0].regularMarketPrice, ' JPYUSD', data[2].regularMarketPrice / data[0].regularMarketPrice)
//
// })()

// const fetchCur = async () => {
//     const {data: {quoteResponse: {result: data}}} = await axios('https://query1.finance.yahoo.com/v7/finance/quote?region=US&lang=en&symbols=USDRUB=X,USDRUB=X,EURRUB=X,RUBEUR=X,EURJPU=X,JPYEUR=X,EURGBP=X,GBPERU=X');
// }
//
// (async () => {
//     const timeStart = new Date().getTime();
//
//     for (let i = 0; i < 1000; i++) {
//         try {
//             await Promise.all([
//                 fetchCur(),
//                 fetchCur(),
//                 fetchCur(),
//                 fetchCur(),
//                 fetchCur()
//             ]);
//
//             console.log('requests', i * 5, 'time', (new Date().getTime() - timeStart) / 1000, 'sec')
//         } catch (e) {
//             console.error('end', e);
//             break;
//         }
//     }
// })()

// curl 'https://query1.finance.yahoo.com/v7/finance/spark?symbols=EURCAD%3DX&range=1d&interval=5m&indicators=close&includeTimestamps=false&includePrePost=false&corsDomain=finance.yahoo.com&.tsrc=finance' --compressed
// curl -X 'GET' 'https://yfapi.net/v8/finance/spark?interval=1d&range=1mo&symbols=AAPL%2CMSFT' -H 'accept: application/json'
// Yahoo finance swagger https://www.yahoofinanceapi.com/ - ! BASE URL INVALID
// List - https://free.currconv.com/api/v7/currencies?apiKey=ff88e54b8ac10e2c19b3
// Countries - https://free.currconv.com/api/v7/countries?apiKey=ff88e54b8ac10e2c19b3
// Exchange - https://free.currconv.com/api/v7/convert?q=USD_PHP,PHP_USD&compact=ultra&apiKey=ff88e54b8ac10e2c19b3
// Yahoo finance update delay - https://help.yahoo.com/kb/SLN2310.html
// Сохранять стату похода в апи yahoo

// https://finance.yahoo.com/currencies
// https://github.com/ranaroussi/yfinance

/**
 * План
 *
 * + Проверить ручку получения истории. Совпадает ли последнее значение из нее с тем что приходит и quote + понять время обновления цен
 * + Сделать стресс тест для ручек и попробовать словить ошибку
 * Основные пары берутся из апи, неосновные рассчитываются через baseCurrency
 * Получить список из free.currconv.com/ по таймеру
 * Получать базовые валюты из free.currconv.com/ по таймеру
 * Получать треш валюты из yf по требования
 * Выбрать валютные пары, которые буду поддерживать
 * Настроить стату в монге
 */

/*
EURUSD
USDJPY
GBPUSD
AUDUSD
USDCHF
USDCAD
EURJPY
EURGBP
EURRUB
USDRUB
CNYRUB

GBP
CAD
CHF
RUB
EUR
JPY
USD
AUD
GEL
TRY
 */

/**
 * Валюта со всей инфой в нужном формате
 * Сделать добавление через миграцию, что бы то произошлоодин раз (?)
 *
 * https://api.currencyapi.com/v3/currencies?apikey=bgP7hskqSM9dmgB24PbJYfOmHiJOjFn6bWqPVxIf
 */

