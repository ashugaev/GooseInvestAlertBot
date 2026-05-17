#!/bin/sh

# Helper script: write CI/environment variables into a local `.env` file.
# Useful in deployment pipelines where each variable arrives as its own env
# var and the bot expects them in a single `.env`.

touch -a .env

echo "TELEGRAM_TOKEN=${TELEGRAM_TOKEN}" >> .env
echo "STOCKS_API_TOKEN=${STOCKS_API_TOKEN}" >> .env
echo "MONGO_URL=${MONGO_URL}" >> .env
echo "SENTRY_URL=${SENTRY_URL}" >> .env
echo "BINANCE_APISECRET=${BINANCE_APISECRET}" >> .env
echo "BINANCE_APIKEY=${BINANCE_APIKEY}" >> .env
echo "BYBIT_API_KEY=${BYBIT_API_KEY}" >> .env
echo "BYBIT_API_SECRET=${BYBIT_API_SECRET}" >> .env
echo "KUCOIN_API_KEY=${KUCOIN_API_KEY}" >> .env
echo "KUCOIN_API_SECRET=${KUCOIN_API_SECRET}" >> .env
echo "KUCOIN_API_PASSPHRASE=${KUCOIN_API_PASSPHRASE}" >> .env
echo "LBANK_API_KEY=${LBANK_API_KEY}" >> .env
echo "LBANK_API_SECRET=${LBANK_API_SECRET}" >> .env
echo "CURRENCY_CONVERTER_APIKEY=${CURRENCY_CONVERTER_APIKEY}" >> .env
echo "COINBASE_TOKEN=${COINBASE_TOKEN}" >> .env
echo "TRONSCAN_API_KEY=${TRONSCAN_API_KEY}" >> .env
echo "TRONSCAN_WALLET_ADDRESS=${TRONSCAN_WALLET_ADDRESS}" >> .env
echo "BOSS_TG_ID=${BOSS_TG_ID}" >> .env
echo "TEST_USER_TG_ID=${TEST_USER_TG_ID}" >> .env
echo "NODE_ENV=production" >> .env
