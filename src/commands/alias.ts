// Dependencies
import {Telegraf, Context, Extra} from "telegraf";
import {aliasRemove, createAlias, getAlias, removePriceAlert} from "../models";
import {log} from "../helpers/log";
import {getLastPrice} from "../helpers/stocksApi";

export function setupAlias(bot: Telegraf<Context>) {
    bot.command('alias', async ctx => {
        try {
            const {text} = ctx.message;
            const user = ctx.from.id;

            let data = text.match(/^\/alias$/)

            // Если нужен просто список
            if (data) {
                const aliases = await getAlias({user});

                if (!aliases.length) {
                    await ctx.replyWithHTML(ctx.i18n.t('aliasesEmpty'))
                    return;
                }

                for (let i = 0; aliases.length > i; i++) {
                    const {title, symbol, _id} = aliases[i];

                    await ctx.replyWithHTML(
                        ctx.i18n.t('aliasListItem', {
                            title,
                            symbol
                        }),
                        Extra
                            .HTML(true)
                            .markup((m) => m.inlineKeyboard([
                                m.callbackButton(ctx.i18n.t('alertListDeleteButton'),
                                    `delete_alias_${_id}`
                                )
                            ]))
                    )
                }

                return;
            }

            data = text.match(/^\/alias remove ([a-zA-Zа-яА-ЯёЁ0-9]+)$/)

            // если хотим удалить
            if (data) {
                const alias = data[1];

                await aliasRemove({title: alias, user});

                await ctx.replyWithHTML(ctx.i18n.t('aliasRemoved', {
                    title: alias,
                }))

                return
            }

            data = text.match(/^\/alias (\w+) ([a-zA-Zа-яА-ЯёЁ0-9]+)$/)

            // если хотим добавить
            if (data) {
                const symbol = data[1].toUpperCase()
                const alias = data[2]

                // Проверки того, что бумага для которой делаем алиас существует
                try {
                    await getLastPrice(symbol);
                } catch (e) {
                    await ctx.replyWithHTML(
                        ctx.i18n.t('alertErrorUnexistedSymbol', {symbol}),
                        {disable_web_page_preview: true}
                    )
                    log.error(e);
                    return;
                }

                // Проверка на то что такого алиаса у этого юзера не существует
                try {
                    if ((await getAlias({title: alias, user})).length > 0) {
                        await ctx.replyWithHTML(ctx.i18n.t('aliasExisted', {
                            title: alias,
                        }))

                        return;
                    }
                } catch (e) {
                    await ctx.replyWithHTML(ctx.i18n.t('aliasAnyError'))

                    log.error(e);
                }


                // создание алиаса
                try {
                    await createAlias({title: alias, symbol, user})
                } catch (e) {
                    log.error(e)
                    await ctx.reply(JSON.stringify(e))
                    return;
                }

                await ctx.replyWithHTML(ctx.i18n.t('aliasCreated', {
                    title: alias,
                    symbol
                }))


                return;
            }

            // Invalid Format
            await ctx.replyWithHTML(ctx.i18n.t('aliasListErrorInvalidFormat'))
        } catch (e) {
            ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
            log.error(e);
        }
    })

    bot.action(/^delete_alias_(.*)$/, async (ctx) => {
        const _id = ctx.match[1];

        try {
            const deletedCount = await aliasRemove({_id});

            await ctx.deleteMessage();

            if (deletedCount === 0) {
                await ctx.replyWithHTML(ctx.i18n.t('aliasAlreadyRemoved'))
            }
        } catch (e) {
            log.error(e);
            await ctx.reply(ctx.i18n.t('alertListItemDeleteError'))
        }
    })
}
