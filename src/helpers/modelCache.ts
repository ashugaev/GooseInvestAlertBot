import { ReturnModelType } from '@typegoose/typegoose'
import { wait } from '@/helpers/wait'
import { log } from '@/helpers/log'
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types'

export interface ModelCacheParams {
  Model: ReturnModelType<any>
  autoUdatePeriod?: number
  logPref: string
}

export class ModelCache<Item> {
  items = []
  isReady = false
  needToBeUpdated = true // allows to enforce update
  autoUdatePeriod = 1000 * 60 * 3
  Model: ReturnModelType<Item & AnyParamConstructor<any>> = null
  logPref = '[MODEL CACHE]'

  /**
   * @todo: Fetch filterx from db
   */
  constructor({ autoUdatePeriod, Model, logPref }: ModelCacheParams) {
    this.logPref = logPref || this.logPref
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

        const items = await this.Model.find().lean()

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
