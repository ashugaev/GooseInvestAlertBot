<div align="center">

<img src="logo.svg" alt="Goose Invest Alert" width="140" />

# Goose Invest Alert Bot

**Telegram bot that pings you when a stock or crypto price hits your target.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Telegram](https://img.shields.io/badge/Telegram-@GooseInvestAlertBot-26A5E4?logo=telegram)](https://t.me/GooseInvestAlertBot)

</div>

---

## Try it

You don't need to install anything — the bot is already live:

> **[@GooseInvestAlertBot](https://t.me/GooseInvestAlertBot)** — open in Telegram and send `/start`.

Need help? Drop into the support chat: **[@GooseInvestAlertChat](https://t.me/GooseInvestAlertChat)**.

## What it does

- **Price-level alerts** — get a message when a ticker crosses a price you set, up or down.
- **Speed alerts** — get a message when a coin or stock moves unusually fast in a short window.
- **Stocks and crypto in one place** — Tinkoff Invest for stocks; Binance, Binance Futures, Bybit, KuCoin, and LBank for crypto; fiat pairs (EUR/USD, USD/RUB, …) too.
- **Bring your own bot** — connect a private Telegram bot for your group or channel.
- **English and Russian** out of the box.

## Common commands

| Command | What it does |
|---|---|
| `/alert YNDX 73.80` | Notify when YNDX hits 73.80 |
| `/alert BTC +10% -25%` | Notify on ±X% from the current price |
| `/alert DOGERUB 70` | Set the alert in a specific currency |
| `/shift BTC` | Watch for unusually fast price moves |
| `/list` | See and edit all your alerts |
| `/price YNDX` | Get the current price right now |
| `/remove` | Bulk-remove alerts |
| `/admin` | Manage alerts for groups you've added the bot to |
| `/help` | Full reference inside Telegram |

A walkthrough with examples appears as soon as you send `/help` to the bot.

## Run your own copy

Prefer to self-host? You'll need:

- Node.js 20
- MongoDB (local or a free hosted one like Atlas)
- A bot token from [@BotFather](https://t.me/BotFather)
- A Tinkoff Invest API token (free, [get it here](https://www.tinkoff.ru/invest/settings/api/))

```bash
git clone https://github.com/ashugaev/GooseInvestAlertBot.git
cd GooseInvestAlertBot
npm install
cp .env.sample .env          # fill in TELEGRAM_TOKEN, MONGO_URL, …
npm run db-migration:up
npm run dev:watch
```

That's it — the bot starts and connects to Telegram. Full list of settings (exchange API keys, payment providers, GPT-based signal parsing, etc.) is in **[CONFIG.md](CONFIG.md)**.

Docker shortcut:

```bash
docker compose up --build
```

## Documentation

- **[CONFIG.md](CONFIG.md)** — every environment variable explained.
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — workflow, code style, how to send a PR.
- **[SECURITY.md](SECURITY.md)** — responsible disclosure.
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** — community standards.

## License

Released under the [MIT License](LICENSE). Free to use, fork, and ship your own bot.
