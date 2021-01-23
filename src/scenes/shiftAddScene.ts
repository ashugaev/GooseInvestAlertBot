import {Scenes} from "../constants";

import * as WizardScene from 'telegraf/scenes/wizard';
import * as Composer from 'telegraf/composer';
import {i18n} from "../helpers/i18n";
import {log} from "../helpers/log";
import {sceneWrapper} from "../helpers/sceneWrapper";
import {createShift} from "../models/Shifts";

const plural = require('plural-ru');

/**
 * Сцена сработает только на первое сообщение, которое явлется текстом и не командой
 */

const startShiftAddScene = sceneWrapper('shift_add_start-scene', (ctx) => {
    ctx.replyWithHTML(i18n.t('ru', 'shift_add_startScene'))

    return ctx.wizard.next()
})

const shiftAddChoosePercentScent = new Composer()

// Не нечинается с /
shiftAddChoosePercentScent.hears(/^(?!\/).+$/, sceneWrapper('shift_add_choose-percent', async (ctx) => {
    const {text: percent} = ctx.message;

    const floatPercent = parseFloat(percent);

    if (floatPercent) {
        await ctx.replyWithHTML(i18n.t('ru', 'shift_add_setTime'))

        ctx.wizard.state.percent = floatPercent;

        return ctx.wizard.next();
    } else {
        ctx.replyWithHTML(i18n.t('ru', 'shift_add_setPercentError'))
        // Повторить текущий степ
        return ctx.wizard.selectStep(ctx.wizard.cursor);
    }
}))

// Если сообщение не то, что ожидаем - покидаем сцену
shiftAddChoosePercentScent.on('message', (ctx, next) => {
    next()
    return ctx.scene.leave();
});

const shiftAddSetHourScene = new Composer()

// Не нечинается с '/'
shiftAddSetHourScene.hears(/^(?!\/).+$/, sceneWrapper('shift_add_setHour', async (ctx) => {
    const {text: hour} = ctx.message;
    const {id: user} = ctx.from;
    const {percent} = ctx.wizard.state;

    const intHour = parseInt(hour);

    if (intHour) {
        try {
            await createShift({
                percent,
                time: intHour,
                user,
            });
        } catch (e) {
            ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'));
            log.error(e);
            return ctx.wizard.selectStep(ctx.wizard.cursor);
        }

        await ctx.replyWithHTML(i18n.t('ru', 'shift_add_created', {
            time: intHour,
            hours: plural(intHour, 'час', 'часа', 'часов'),
            percent
        }))

        return ctx.scene.leave();
    } else {
        ctx.replyWithHTML(i18n.t('ru', 'shift_add_setTimeError'));
        return ctx.wizard.selectStep(ctx.wizard.cursor);
    }
}));

// Если сообщение не то, что ожидаем - покидаем сцену
shiftAddSetHourScene.on('message', (ctx, next) => {
    next()
    return ctx.scene.leave();
});

export const shiftAddScene = new WizardScene(Scenes.shiftAdd,
    startShiftAddScene,
    shiftAddChoosePercentScent,
    shiftAddSetHourScene,
)
