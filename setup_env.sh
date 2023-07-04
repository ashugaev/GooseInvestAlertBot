#!/bin/sh

## ВЫПОЛНЯЕТСЯ ДЛЯ ЗАПИСИ ПЕРЕМЕННЫХ ОКРУЖЕНИЯ В ФАЙЛ .env В КОНТЕЙНЕРУ
## FIXME: Избавиться от этого файла и объявлять переменные через докер/gitlab

touch -a .env

echo "TELEGRAM_TOKEN=${TELEGRAM_TOKEN}" >> .env
echo "STOCKS_API_TOKEN=${STOCKS_API_TOKEN}" >> .env
echo "MONGO_URL=${MONGO_URL}" >> .env
echo "SENTRY_URL=${SENTRY_URL}" >> .env
echo "CHATBASE_ANALYTICS_TOKEN=${CHATBASE_ANALYTICS_TOKEN}" >> .env
echo "BINANCE_APISECRET=${BINANCE_APISECRET}" >> .env
echo "BINANCE_APIKEY=${BINANCE_APIKEY}" >> .env
echo "CURRENCY_CONVERTER_APIKEY=${CURRENCY_CONVERTER_APIKEY}" >> .env
echo "BOSS_TG_ID=${BOSS_TG_ID}" >> .env
echo "TEST_USER_TG_ID=${TEST_USER_TG_ID}" >> .env
echo "NODE_ENV=production" >> .env
echo "SESSION_STRING=${SESSION_STRING}" >> .env
echo "TELEGRAM_ANN_SESSION_STRING=${TELEGRAM_ANN_SESSION_STRING}" >> .env
echo "TELEGRAM_API_ID=${TELEGRAM_API_ID}" >> .env
echo "TELEGRAM_API_HASH=${TELEGRAM_API_HASH}" >> .env
echo "KUCOIN_API_KEY=${KUCOIN_API_KEY}" >> .env
echo "KUCOIN_API_SECRET=${KUCOIN_API_SECRET}" >> .env
echo "KUCOIN_API_PASSPHRASE=${KUCOIN_API_PASSPHRASE}" >> .env
echo "LBANK_API_KEY=${LBANK_API_KEY}" >> .env
echo "LBANK_API_SECRET=${LBANK_API_SECRET}" >> .env
