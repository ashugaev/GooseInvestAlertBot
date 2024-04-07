import { ReturnModelType } from '@typegoose/typegoose'
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types'

import { log } from '@/helpers/log'
import { wait } from '@/helpers/wait'

export interface ModelCacheParams<Item> {
  Model: ReturnModelType<any>
  autoUdatePeriod?: number
  logPref: string
  filters?: Partial<Item>
}

export class ModelCache<Item> {
  items: Item[] = []
  isReady = false
  needToBeUpdated = true // allows to enforce update
  autoUdatePeriod = 1000 * 60 * 3
  Model: ReturnModelType<Item & AnyParamConstructor<any>> = null
  logPref = '[MODEL CACHE]'
  filters: Partial<Item> = {}

  /**
   * @todo: Fetch filterx from db
   */
  constructor({
    autoUdatePeriod,
    Model,
    logPref,
    filters = {},
  }: ModelCacheParams<Item>) {
    this.logPref = logPref || this.logPref
    this.filters = filters
    this.Model = Model
    this.autoUdatePeriod = autoUdatePeriod || this.autoUdatePeriod

    this.init()
  }

  updateItems() {
    this.needToBeUpdated = true
  }

  async init() {
    this.setupUpdater()
  }

  async setupUpdater() {
    let timerId: NodeJS.Timeout
    let inProgress = false

    while (true) {
      if (!this.needToBeUpdated || inProgress) {
        await wait(1000) // 1 sec
        continue
      }

      try {
        inProgress = true

        // @ts-expect-error
        const items = await this.Model.find(this.filters).lean()

        this.items = items as unknown as Item[]
        this.needToBeUpdated = false
        this.isReady = true
        log.info(this.logPref, 'Items updated')
      } catch (e) {
        log.error(this.logPref, 'Items update crashed', e)
      } finally {
        clearTimeout(timerId)
        timerId = setTimeout(() => {
          this.needToBeUpdated = true
        }, this.autoUdatePeriod)

        inProgress = false
      }
    }
  }
}
