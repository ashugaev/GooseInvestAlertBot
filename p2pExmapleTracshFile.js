// FIXME: Kill this file after api implementation

const https = require("https");

// Репа с примером
// https://github.com/sanchezmarcos/binancio/

function fetchP2PData(
    page = 1,
    fiat = "CNY",
    tradeType = "BUY",
    asset = "USDT",
    payTypes = []
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
