import {Scenes} from "../constants";

import * as WizardScene from 'telegraf/scenes/wizard';
import * as Composer from 'telegraf/composer';
import {i18n} from "../helpers/i18n";
import {log} from "../helpers/log";
import {getInstrumentDataBySymbolOrAlias} from "../helpers/getInstrumentData";
import {symbolOrCurrency} from "../helpers/symbolOrCurrency";
import {addAlert} from "../helpers/addAlert";
import {addMessageStep} from "./alertAddMessageScene";

/**
 * Сцена сработает только на первое сообщение, которое явлется текстом и не командой
 */

const startAlertAddScene = (ctx) => {
    ctx.replyWithHTML(ctx.i18n.t('alert_add_chooseInstrument'))

    return ctx.wizard.next()
}

const addInstrumentNameStep = new Composer()

// Не нечинается с /
addInstrumentNameStep.hears(/^(?!\/).+$/, async (ctx) => {
    const {text: symbol} = ctx.message;
    const {id: user} = ctx.from;

    try {
        const {instrumentData} = await getInstrumentDataBySymbolOrAlias({symbol, user, ctx});

        ctx.wizard.state.instrumentData = instrumentData;

        await ctx.replyWithHTML(i18n.t('ru', 'alert_add_choosePrice', {
            price: instrumentData.lastPrice,
            currency: symbolOrCurrency(instrumentData.currency)
        }))

        return ctx.wizard.next();
    } catch (e) {
        log.error(e);

        // Повторить текущий степ
        return ctx.wizard.selectStep(ctx.wizard.cursor);
    }
})

// Если сообщение не то, что ожидаем - покидаем сцену
addInstrumentNameStep.on('message', (ctx, next) => {
    next()
    return ctx.scene.leave();
});

const addInstrumentPriceStep = new Composer()

// Не нечинается с '/'
addInstrumentPriceStep.hears(/^(?!\/).+$/, async (ctx) => {
    const {text: price} = ctx.message;
    const {ticker: symbol} = ctx.wizard.state.instrumentData;
    let addedCount = null;

    try {
        const result = await addAlert({
            data: {symbol, price},
            ctx,
            startedFromScene: true,
        });

        addedCount = result.addedCount;

        if(addedCount === 0) {
            throw new Error('Не добавлено ни одной цен');
        }

        ctx.wizard.state._id = result._id;
    } catch (e) {
        log.error(e);

        // Повторить текущий степ
        return ctx.wizard.selectStep(ctx.wizard.cursor);
    }

    if (addedCount === 1) {
        ctx.replyWithHTML(i18n.t('ru', 'alertCreatedAddMessage'))
        return ctx.wizard.next();
    } else {
        return ctx.scene.leave();
    }
});

// Если сообщение не то, что ожидаем - покидаем сцену
addInstrumentPriceStep.on('message', (ctx, next) => {
    next()
    return ctx.scene.leave();
});

export const alertAddScene = new WizardScene(Scenes.alertAdd,
    startAlertAddScene,
    addInstrumentNameStep,
    addInstrumentPriceStep,
    addMessageStep
)
