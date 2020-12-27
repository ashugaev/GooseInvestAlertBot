// Config dotenv
import * as dotenv from 'dotenv'

// Строка должна быть выше импорта файлов с переменными окружения
dotenv.config({path: `${__dirname}/../.env`})

import {bot} from './helpers/bot'
import {log} from './helpers/log'
import {checkTime} from './middlewares/checkTime'
import {setupHelp} from './commands/help'
import {setupStart} from './commands/start'
import {setupAlert} from './commands/alert'
import {setupAlias} from './commands/alias'
import {setupI18N} from './helpers/i18n'
import {setupLanguage} from './commands/language'
import {attachUser} from './middlewares/attachUser'
import {setupPriceChecker} from "./priceChecker";
import {setupList} from "./commands/list";
import {alertScene} from "./scenes/alertScene";
import {setupPrice} from "./commands/price";
import * as Sentry from "@sentry/node";

const Stage = require('telegraf/stage')
const session = require('telegraf/session')

Sentry.init({
    dsn: process.env.SENTRY_URL,
    tracesSampleRate: 1.0,
});

const stage = new Stage([alertScene])

bot.use(session())
bot.use(stage.middleware())

// Start checking stocks prices and alerting
setupPriceChecker(bot);

// Check time
bot.use(checkTime)
// Attach user
bot.use(attachUser)
// Setup localization
setupI18N(bot)
// Setup commands
setupHelp(bot)
setupStart(bot)
setupAlert(bot)
setupList(bot)
setupAlias(bot)
setupLanguage(bot)
setupPrice(bot)

// Start bot
bot.startPolling()

log.info('Bot is up and running');
