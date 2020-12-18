// Config dotenv
import * as dotenv from 'dotenv'
dotenv.config({path: `${__dirname}/../.env`})
// Dependencies
import {bot} from './helpers/bot'
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

// Start bot
bot.startPolling()

console.info('Bot is up and running')
