#!/bin/sh

## ВЫПОЛНЯЕТСЯ ДЛЯ ЗАПИСИ ПЕРЕМЕННЫХ ОКРУЖЕНИЯ В ФАЙЛ .env В КОНТЕЙНЕРУ
## FIXME: Избавиться от этого файла и объявлять переменные черезе докер

touch -a .env

echo "TELEGRAM_TOKEN=${TELEGRAM_TOKEN}" >> .env
echo "STOCKS_API_TOKEN=${STOCKS_API_TOKEN}" >> .env
echo "MONGO_URL=${MONGO_URL}" >> .env
echo "SENTRY_URL=${SENTRY_URL}" >> .env
echo "CHATBASE_ANALYTICS_TOKEN=${CHATBASE_ANALYTICS_TOKEN}" >> .env
echo "BINANCE_APISECRET=${BINANCE_APISECRET}" >> .env
echo "BINANCE_APIKEY=${BINANCE_APIKEY}" >> .env
