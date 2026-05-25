# Configuration

Runtime configuration lives in a single `.env` file at the project root.
Copy [`.env.sample`](.env.sample) and fill it in.

## Required environment variables

| Variable | Description |
|----------|-------------|
| `TELEGRAM_TOKEN` | Bot token. Issued by [@BotFather](https://t.me/BotFather). |
| `MONGO_URL` | MongoDB connection string, e.g. `mongodb://localhost:27017/goose`. |
| `STOCKS_API_TOKEN` | Tinkoff Invest API token. Generate from [Invest settings → API](https://www.tinkoff.ru/invest/settings/api/). |
| `BOSS_TG_ID` | Numeric Telegram user ID of the bot owner. Used for admin notifications and the `/admin` command. |
| `NODE_ENV` | `development` or `production`. Switches a few safety guards. |

## Optional: error tracking

| Variable | Description |
|----------|-------------|
| `SENTRY_URL` | Sentry DSN. Leave empty to disable. |

## Optional: exchange API keys

Provide only the keys for exchanges you actually want to poll. Missing keys
simply disable that data source.

| Variable | Provider |
|----------|----------|
| `BINANCE_APIKEY`, `BINANCE_APISECRET` | [Binance](https://www.binance.com/en/my/settings/api-management) |
| `BYBIT_API_KEY`, `BYBIT_API_SECRET` | [Bybit](https://www.bybit.com/app/user/api-management) |
| `KUCOIN_API_KEY`, `KUCOIN_API_SECRET`, `KUCOIN_API_PASSPHRASE` | [KuCoin](https://www.kucoin.com/account/api) |
| `LBANK_API_KEY`, `LBANK_API_SECRET` | [LBank](https://www.lbank.com/login.html) |

## Optional: forex / fiat conversion

| Variable | Description |
|----------|-------------|
| `CURRENCY_CONVERTER_APIKEY` | Free API key from [currencyapi.com](https://app.currencyapi.com/). |

## Optional: premium subscription payments

| Variable | Description |
|----------|-------------|
| `COINBASE_TOKEN` | [Coinbase Commerce](https://commerce.coinbase.com/) API token for card → crypto invoices. |
| `TRONSCAN_API_KEY` | [Tronscan](https://docs.tronscan.org/getting-started) API key. |
| `TRONSCAN_WALLET_ADDRESS` | TRX wallet address; the bot polls it for incoming USDT-TRC20 payments and matches them to pending invoices. |

## Optional: shutdown announcement

| Variable | Description |
|----------|-------------|
| `SHUTDOWN_MODE` | Set to `true` to wind the bot down without taking the process offline. The inbound middleware (`src/middlewares/shutdownMode.ts`) replies with the farewell, `setupCheckers()` is skipped so no cron / price / shift / alert / payment loops start, and the outbound notification paths short-circuit as a safety net. Unset to restore the bot. |

## Optional: MongoDB tuning

These knobs control connection retry / health-check behaviour. The built-in
defaults work for typical setups; tune them only if you observe specific
issues.

| Variable | Default behaviour |
|----------|-------------------|
| `MONGO_CONNECT_TIMEOUT_MS` | Initial connection timeout. |
| `MONGO_SOCKET_TIMEOUT_MS` | Socket-level timeout per operation. |
| `MONGO_RETRY_DELAY_MS` | Pause between reconnect attempts. |
| `MONGO_RETRY_LOG_THROTTLE_MS` | How often "retrying…" log lines are emitted. |
| `MONGO_WAIT_LOG_THROTTLE_MS` | Throttle for "waiting for connection" logs. |
| `MONGO_ERROR_LOG_THROTTLE_MS` | Throttle for repeated error logs. |
| `MONGO_BOSS_ALERT_THROTTLE_MS` | Min interval between admin Telegram alerts. |
| `MONGO_HEALTHCHECK_PERIOD_MS` | Period of the in-process Mongo health probe. |
| `MONGO_STARTUP_MAX_ATTEMPTS` | Max reconnects before the process gives up. |
| `MONGO_STARTUP_RETRY_DELAY_MS` | Delay between startup reconnect attempts. |
