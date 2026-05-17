# Configuration

All runtime configuration lives in two files:

- `.env` — secrets and per-deployment values (see [`.env.sample`](.env.sample)).
- `channels.json` — per-channel rules for the crypto-signals bot (see
  [`channels.example.json`](channels.example.json)). Optional; if absent the
  bot falls back to `channels.example.json`.

Both files are gitignored — never commit your real values.

## Required environment variables

| Variable | Description |
|----------|-------------|
| `TELEGRAM_TOKEN` | Bot token for the alerts bot. Issued by [@BotFather](https://t.me/BotFather). |
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
| `TRONSCAN_WALLET_ADDRESS` | Your TRX wallet address; the bot polls it for incoming USDT-TRC20 payments and matches them to pending invoices. |

## Optional: OpenAI (crypto-signals bot)

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | GPT-based parser for free-form trader posts. |

## Optional: Telegram MTProto client (crypto-signals bot)

Only needed if you run the crypto-signals bot, which reads channels via the
user-account API rather than the bot API.

| Variable | Description |
|----------|-------------|
| `TELEGRAM_SIGNALS_API_ID` | App ID from [my.telegram.org](https://my.telegram.org/apps). |
| `TELEGRAM_SIGNALS_API_HASH` | App hash from [my.telegram.org](https://my.telegram.org/apps). |
| `TELEGRAM_SIGNALS_SESSION_STRING` | Persistent session. Generate with `npm run telegram:get-session-string` after filling the two values above. |
| `TELEGRAM_SIGNALS_BOT_TOKEN` | Telegram bot token used by the signals bot for outgoing messages. |

## Optional: Google Sheets export

| Variable | Description |
|----------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service-account email. |
| `GOOGLE_PRIVATE_KEY` | Service-account private key (`\n`-escaped is fine). |

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

## `channels.json`

The crypto-signals bot reads a JSON configuration that lists which Telegram
channels to monitor and how to interpret their posts.

```json
{
  "tradeConfigByChannel": {
    "<channel_username>": {
      "allowedUTCHours": null,
      "mustBeRoundHour": true,
      "debugMessagesTracker": false,
      "buyAmount": 10
    }
  },
  "monitorConfigByChannelId": {
    "-100<channel_id>": {
      "name": "Display name",
      "keyWords": ["BUY", "SELL"],
      "manualInputPercentOverrideSignalPrice": false,
      "ignoreSignalsWithoutTPSL": false,
      "manualInputPercentAsFallbackForLackOfSignalTPSL": true,
      "removeNotFinished": true
    }
  }
}
```

- `tradeConfigByChannel` keys are channel usernames (no `@`).
- `monitorConfigByChannelId` keys are channel IDs in `-100…` form. Get them by
  forwarding a channel post to [@userinfobot](https://t.me/userinfobot).

If no `channels.json` exists, the bot uses the bundled
`channels.example.json` so it still starts up.
