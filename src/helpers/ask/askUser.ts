/**
 * TODO: Доделать этот модуль
 */
// @ts-nocheck

import { TelegrafContext } from 'telegraf/typings/context'

import { ALERT_SCENES } from '../../commands/alert/alert.constants'
import { AddAlertPayload } from '../../commands/alert/alert.types'
import { i18n } from '../i18n'

export type AskUserCollectedValues = Record<string, any>

export interface UserInputValidator {
  validate: () => {}
  onError: () => string
}

export interface AskUserQuestionConfig {
  /**
   * Название поля под которым будет результат
   */
  name: string
  /**
   * Уже собранные поля
   */
  collectedValues: AskUserCollectedValues
  validators: UserInputValidator[]
  messages: {
    /**
     * Запрос на ввод
     */
    question: () => string
    /**
     * Принимает на вход то
     */
    validationError: (collectedValues: AskUserCollectedValues) => void
    /**
     * Успешное добавления
     */
    success: () => string
  }
  /**
   * Ф-ция валидации.
   * Определит будет ли ошибка добавления.
   */
  callbacks: {
    onSuccess: (updatedValues: AskUserCollectedValues) => void
  }
}

export interface AskUser {
  ctx: TelegrafContext
  questionConfig: AskUserQuestionConfig
  onSuccess: (userInput: {[key: string]: string}) => boolean | undefined
  /**
   * Любые данные которые пробросятся в коллбеки для текстов
   */
  payload: {}
}

/**
 * Модуль получения данных от юзера
 * Поддерживает ввод через:
 * - текстовое сообщение
 * - нажатие кнопки
 */
export const askUser = ({ ctx, questionConfig, onSuccess }: AskUser) => {
  // Эта сцена просто для примера
  ctx.scene.enter(ALERT_SCENES.askPrice, {
    payload: questionConfig,
    onSuccess: onSuccess
  })
}

/// ///

const questionConfig: AskUserQuestionConfig = {
  name: 'price',
  validators: [
    {
      validate: (userInput) => {
        return 'kek'
      },
      errorMessage: (validateResult) => i18n.t('ru', 'alert_add_choosePrice_invalid', {
        invalid: collectedValues.invalidPricesString
      })
    }

  ],
  messages: {
    question: '',
    validationError: (collectedValues) => i18n.t('ru', 'alert_add_choosePrice_invalid', {
      invalid: collectedValues.invalidPricesString
    }),
    success: (collectedValues) => {}
  }
}

/**
 * Ф-ция добавления алерта
 * Если на входе недостаточно данных она их запрашивает у юзера
 */
export const addAlert = (ctx, payload: AddAlertPayload) => {
  const { prices, ticker, instrumentId } = payload

  // if (!ticker) {
  //   ctx.scene.enter(ALERT_SCENES.askTicker)
  //
  //   return
  // }

  if (!prices) {
    // askUser({
    //
    //   ...questionConfig,
    // })

    const config: AskUserQuestionConfig = {
      ...questionConfig,
      callbacks: {
        onSuccess: (updatedValues) => addAlert(ctx, updatedValues),
        onValidate: () => true
      },
      collectedValues: payload
    }

    ctx.scene.enter(ALERT_SCENES.askPrice, config)
  }
}
