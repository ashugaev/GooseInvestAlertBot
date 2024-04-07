import { ReturnModelType } from '@typegoose/typegoose'
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types'
import { BulkWriteOperation } from 'mongodb'

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
  uploadQueue: BulkWriteOperation<Item>[] = []

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
    this.setupUploadQueue()
  }

  /**
   * Add item to upload queue
   */
  addItemToQueue(item: BulkWriteOperation<Item>) {
    this.uploadQueue.push(item)
  }

  /**
   * Items will be updated in bulk every 1 minute
   */
  async setupUploadQueue() {
    while (true) {
      if (!this.uploadQueue.length) {
        await wait(1000 * 60) // 1 min
        continue
      }

      try {
        await this.Model.bulkWrite(this.uploadQueue)

        // Need to avaid the case when items are not in this.items or queue
        // @ts-expect-error
        const items = await this.Model.find(this.filters).lean()
        this.items = items as unknown as Item[]
        this.needToBeUpdated = false

        this.uploadQueue = []
      } catch (e) {
        log.error(this.logPref, 'Failed to upload items', e)
      }
    }
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

        // Items also fetching in `setupUploadQueue`
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
