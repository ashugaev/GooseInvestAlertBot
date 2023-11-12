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
  onSuccess?: () => void
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
export class AskByModel<T> {
  // @ts-expect-error
  model: ReturnModelType<T>
  fields: AskByModelFields<T>
  config: AskByModelConfig<T>
  sceneKey = null
  bot: Telegraf<Context>
  wizard: any

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
    this.newDocument = new model(config.initialData || {})
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
  private async sceneCallback(ctx) {
    debugger

    const kek = {
      0: 'fieldOne',
      1: 'fieldTwo',
      2: 'fieldThree',
    }

    const val = kek[this.iteration]

    ctx.replyWithHTML(val)

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
      immediateStep('send token', this.sceneCallback)
    )

    return this.wizard
  }

  /**
   *
   * Call it when it's time to start scene
   */
  startScene(ctx: Context) {
    // @ts-ignore
    return ctx.scene.enter(this.sceneKey)
  }
}
