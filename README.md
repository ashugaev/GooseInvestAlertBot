# Goose Invest Alert Bot

A Telegram bot that watches prices for stocks and cryptocurrencies and pings
you when something interesting happens — a level is crossed, a coin is moving
faster than usual, or a tracked signal channel publishes a new trade.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features

- **Price-level alerts** (`/alert`) — be notified when a ticker hits a target
  price, in either direction.
- **Speed alerts** (`/shift`) — detect unusually fast moves over short
  windows.
- **Multi-source pricing** — Tinkoff Invest for stocks; Binance, Binance
  Futures, Bybit, KuCoin, and LBank for crypto; an external currency API for
  fiat pairs.
- **Crypto-signals bot** (optional) — reads configured signal channels via
  Telegram's MTProto API, parses trader posts (with or without GPT), and
  optionally executes trades on supported exchanges.
- **Premium subscriptions** — built-in Coinbase Commerce + USDT-TRC20 flows
  (entirely optional).
- **Russian + English UI** via `telegraf-i18n`.

The deployed instance is run by the project author as
[@GooseInvestAlertBot](https://t.me/GooseInvestAlertBot), with the support
chat at [@GooseInvestAlertChat](https://t.me/GooseInvestAlertChat).

## Quickstart

### Prerequisites

- **Node.js 20** (the `Dockerfile` pins `node:20-bullseye-slim`).
- **MongoDB** reachable from the bot (local or hosted — Atlas works).
- A **Telegram bot token** from [@BotFather](https://t.me/BotFather).
- Tokens for any market data sources you want to use (see [CONFIG.md](CONFIG.md)).

### Local run

```bash
git clone https://github.com/ashugaev/GooseInvestAlertBot.git
cd GooseInvestAlertBot
npm install
cp .env.sample .env             # fill in TELEGRAM_TOKEN, MONGO_URL, …
cp channels.example.json channels.json  # optional, only for the signals bot
npm run db-migration:up         # create indexes & defaults
npm run dev:watch               # live rebuild + restart
```

A one-shot run is also available:

```bash
npm run build
npm start
```

### Docker

Build & run locally:

```bash
docker compose up --build
```

### Deployment

The upstream instance is deployed on **DigitalOcean App Platform**, which
builds the image from `Dockerfile` directly from the GitHub repo on every
push to `master` — there is no GitHub Actions deploy job. Fork users can:

- point their own DigitalOcean App at their fork, or
- run the image elsewhere — `.github/workflows/docker.yml` publishes it to
  `ghcr.io/<owner>/goose-invest-alert` on every push to `master`.

## Configuration

See [`CONFIG.md`](CONFIG.md) for the full list of environment variables, what
each one does, and where to obtain it. The bot only needs four to start:
`TELEGRAM_TOKEN`, `MONGO_URL`, `STOCKS_API_TOKEN`, `BOSS_TG_ID`.

For the crypto-signals bot specifically, see the **`channels.json`** section
in `CONFIG.md`.

## Repository layout

```
src/app.ts        Entry: dotenv → Telegraf → mongoose → cron → bots
src/bots/         Multi-bot setup (alerts bot, cryptoSignals bot)
src/commands/     Telegram commands and Telegraf scenes
src/cron/         Schedulers: priceChecker, shiftsChecker, statSender, …
src/integrations/ External services (telegram, openai, google, tronscan)
src/marketApi/    Market data sources (binance, bybit, tinkoff, kucoin, lbank, …)
src/paymentApi/   Payment providers (Coinbase, Tronscan)
src/models/       Typegoose models (Mongo schemas)
src/modules/      autotrader, priceUpdater, updateTickersList
migrations/       migrate-mongo migrations
locales/          i18n strings (en, ru)
```

See [`CLAUDE.md`](CLAUDE.md) for developer conventions (no semicolons,
`@/` path aliases, English-only code, mandatory unit tests for changed code).

## Development

```bash
npm run lint          # Prettier + ESLint (max 0 warnings)
npm run lint:fix      # autofix where possible
npm test              # Jest unit tests
npm run build         # TypeScript → dist/
```

Pre-commit hooks (husky + lint-staged) run ESLint on staged files.

## Contributing

PRs welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) for the workflow.

## Security

Found a vulnerability? See [`SECURITY.md`](SECURITY.md) for responsible
disclosure.

## License

[MIT](LICENSE).
