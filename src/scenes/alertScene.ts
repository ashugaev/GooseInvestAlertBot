import {Scenes} from "../constants";

import * as WizardScene from 'telegraf/scenes/wizard';
import * as Composer from 'telegraf/composer';
import {updateAlert} from "../models";
import {i18n} from "../helpers/i18n";
import {log} from "../helpers/log";

/**
 * Сцена сработает только на первое сообщение, которое явлется текстом и не командой
 */

const addMessageStep = new Composer()

// Не нечинается с /
addMessageStep.hears(/^(?!\/).+$/, async (ctx) => {
    const {text} = ctx.message;
    const {_id} = ctx.wizard.state;

    try{
        const result = await updateAlert({
            _id,
            data: {
                message: text
            }
        })

        if (result.nModified) {
            ctx.replyWithHTML(i18n.t('ru', 'alertMessageUpdated'))
        } else {
            ctx.replyWithHTML(i18n.t('ru', 'alertMessageUpdateError'))
        }
    } catch (e) {
        ctx.replyWithHTML(i18n.t('ru', 'alertMessageUpdateError'))

        log.error(e);
    }

    return ctx.scene.leave();
});

addMessageStep.on('message', (ctx, next) => {
    next()
    return ctx.scene.leave();
});

export const alertScene = new WizardScene(Scenes.alert,
    (ctx) => {
        ctx.replyWithHTML(ctx.i18n.t('alertCreatedAddMessage'))
        return ctx.wizard.next()
    },
    addMessageStep
)
