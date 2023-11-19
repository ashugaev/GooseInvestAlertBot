/*
  askByModel(
     TestModel,
     {
        fieldOne: (data) => ({
           skip: true,
           type: 'oneOf',
           question: 'Enter field one',
           variants: ['test', 'test2'],
        }),
        fieldTwo: (data) => ({
          question: 'Enter field two',
          type: 'number',
          validation: (value) => {
              return value === 'test'
          },
          error: 'Wrong value',
        })
     },
     {
         
         result: (data) => {
        return `Items was created with this data: ${data}`
        },
        retryIfValidationError: true,
        autocreateItemInDB: false,
        onSuccess: () => {
              console.log('Success')
       }
     }
    )
 */

import { ReturnModelType } from '@typegoose/typegoose'
import { Document } from 'mongoose'
import { Context, Telegraf } from 'telegraf'

import { randomString } from '@/helpers/string/randomString'
import { immediateStep } from '@/scenes'

const WizardScene = require('telegraf/scenes/wizard')

export interface AskByModelConfig<T> {
  result?: (data: Partial<T>) => string
  retryIfValidationError?: boolean
  autocreateItemInDB?: boolean
  onSuccess?: (ctx: Context, data: Partial<T>) => Promise<void>
}

export interface AskByModelField {
  skip?: boolean
  type: 'string' | 'number' | 'oneOf'
  question: string
  variants?: string[]
  validation?: (value: string) => boolean
  error?: string
}

export interface AskByModelFields<T> {
  [key: string]: (data: Partial<T>) => AskByModelField
}

export interface AskByModelResult<T> {
  setupInitialData: (data: T) => void
  scene
}

// TODO: To class
// TODO: Remove document on crash/leave

/**
 * Usage:
 * - Create instance in *.scenes.ts and configure it
 * - Call init() inside command
 * - Call createScene() inside new Stage()
 * - Call startScene() when it's time to start scene
 */
export class AskByModel<T> {
  collectedData: Partial<T> = {}

  // @ts-expect-error
  model: ReturnModelType<T>
  fields: AskByModelFields<T>
  config: AskByModelConfig<T>
  sceneKey = null
  bot: Telegraf<Context>
  wizard: any
  /**
   * This filter shows this we want to update entity, not create a new one
   */
  updateFilter: Partial<T> = {}

  newDocument: Document<T> = null

  constructor(
    // @ts-expect-error
    model: ReturnModelType<T>,
    fields: AskByModelFields<T>,
    config: AskByModelConfig<T>
  ) {
    this.model = model
    this.fields = fields
    this.config = config

    // @ts-ignore
    this.collectedData = config.initialData || {}

    // @ts-ignore
    // this.newDocument = new model(config.initialData || {})
    // TODO: Add validation
    // this.newDocument.$isValid('kek')
  }

  /**
   * Call inside command
   */
  init({ bot }: { bot: Telegraf<Context> }) {
    this.bot = bot
  }

  iteration = 0
  questonAskedForField = null // Helping to understand if it's request iteration or answer validation
  waitingAnswerType: 'immediate' | 'text' = 'immediate'
  private async sceneCallback(ctx) {
    const allFiledsToCollect = Object.keys(this.fields)
    const collectedFileds = Object.keys(this.collectedData)

    const fieldsToCollect = allFiledsToCollect.filter(
      (field) => !collectedFileds.includes(field)
    )

    if (!fieldsToCollect.length) {
      return ctx.scene.leave()
    }

    const fieldConfig = this.fields[fieldsToCollect[0]](this.collectedData)

    ctx.replyWithHTML(fieldConfig.question)

    this.questonAskedForField = fieldsToCollect[0]

    this.iteration++

    return ctx.wizard.selectStep(ctx.wizard.cursor) // Repeat
  }

  /**
   * Call on root level for add listeners inside new Stage()
   */
  createScene() {
    this.sceneKey = randomString()

    this.wizard = new WizardScene(
      this.sceneKey,
      immediateStep('send token', this.sceneCallback.bind(this))
    )

    return this.wizard
  }

  /**
   *
   * Call it when it's time to start scene
   */
  startScene({
    ctx,
    updateFilter,
  }: {
    ctx: Context
    updateFilter: Partial<T & { _id: string }>
  }) {
    this.updateFilter = updateFilter

    // @ts-ignore
    return ctx.scene.enter(this.sceneKey)
  }
}
