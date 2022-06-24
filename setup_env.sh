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
echo "NODE_EVN=production" >> .env
