# CLAUDE.md

## Scope & Safety
- Keep this file lean — only what an agent can't derive from code, ESLint, or standard conventions.
- `CLAUDE.md` and `AGENTS.md` are mirrors. Any change to one must be reflected in the other in the same commit.
- All code, comments, identifiers, log messages, and commit messages must be in English. User-facing strings (Telegram replies) live under `locales/`.

## Repository Structure
```
src/
  app.ts            # Entry: dotenv → Telegraf → mongoose → cron → bots
  config.ts         # Static feature/app flags
  bots/             # Multi-bot setup (cryptoSignals, …)
  commands/         # Telegram commands and Telegraf scenes
  scenes/           # Shared Telegraf scene wrappers
  cron/             # Schedulers: priceChecker, shiftsChecker, statSender, …
  integrations/     # External services (telegram, openai, google, tronscan)
  marketApi/        # Market data sources (binance, bybit, tinkoff, kucoin, lbank, currencyConverter)
  paymentApi/       # Payment providers
  models/           # Typegoose models (Mongo schemas)
  modules/          # autotrader, priceUpdater, updateTickersList
  middlewares/      # Telegraf middlewares
  features/         # Feature toggles / experiments
  helpers/          constants/  keyboards/  menu/  types/
  tests/            # In-process health probes started from cron (not Jest)
migrations/         # migrate-mongo migrations
locales/            # i18n strings (telegraf-i18n)
channels.example.json  # Template for crypto-signal channel config (copy to channels.json)
```

## Stack
- Node 20 (use the version pinned in `Dockerfile`), TypeScript 4.9, target `esnext`, output → `dist/`.
- Telegram bot via Telegraf; long-polling — no inbound HTTP port.
- MongoDB via mongoose + @typegoose/typegoose.
- Sentry for error tracking; cron via the `cron` package.
- Path alias: `@/*` → `src/*`. Runtime alias for built code via `module-alias` (`@` → `dist/`).

## Build / Run
- `npm run build` — `rimraf ./dist && tsc --skipLibCheck`. Run after every code change before declaring done.
- `npm start` — runs the built bot from `dist/app.js`. Requires `.env` at repo root.
- `npm run dev:watch` — concurrent `tsc -w` + `nodemon dist/app.js`.
- `npm run dev:static` — one-shot rebuild + run.
- `npm run db-migration:up` / `:down` — `migrate-mongo` against `migrations/`.
- `.env` is required (see `.env.sample`); secrets are not committed.
- `channels.json` (gitignored) holds the per-channel signal config; copy `channels.example.json` and edit. The bot falls back to the example if no `channels.json` exists.

## Lint / Test
- `npm run lint` — Prettier + ESLint (`--max-warnings 0`). `lint:fix` for auto-fixes.
- ESLint highlights: no semicolons (`@typescript-eslint/semi: never`), `max-len: 128`, `simple-import-sort`, `unused-imports`, `no-relative-import-paths` — always import via `@/…`, not `../../`.
- `npm test` — Jest. Keep tests pure: no live Mongo, no live network, no transitive imports of `src/app.ts`. If the touched function has heavy collaborators (mongoose models, Telegraf, axios), extract a pure dep-injected helper into its own file and test that helper.
- **Required: any code you add or modify must be covered by Jest unit tests next to the source (`*.test.ts`).** Run `npx jest --testPathPattern='<your files>'` before declaring done.

## Conventions
- New TS files: no semicolons, single quotes, sorted imports, alias paths only.
- New Mongo collections: typegoose model in `src/models/`, export from `src/models/index.ts`, add a migration in `migrations/` when shape changes.
- Telegram features that need multi-step input: implement as a Telegraf scene under `src/commands/<name>/<name>.scenes.ts` and register it in the bot setup.
- Magic numbers in business logic must have an inline comment explaining the unit/source.
- Don't reintroduce `../../` relative imports — the lint rule will reject them.

## Deployment
- Docker image is built from `Dockerfile`; `docker-compose.yml` is for local containerised runs (`npm run docker:up`).
- `docker-compose-remote.yml` is for server-side deployment from a pre-built image (set `IMAGE` env var).
- CI runs in GitHub Actions (`.github/workflows/`).

## Git & PR
- Branch names: short, kebab-case, descriptive (e.g. `add-volume-alerts`).
- One feature per PR. Don't merge while CI is red — fix the failure even if it predates your branch.
- Commit messages and PR descriptions in English.
