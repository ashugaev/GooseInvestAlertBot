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
  customFind?: any
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
  customFind

  /**
   * @todo: Fetch filterx from db
   */
  constructor({
    autoUdatePeriod,
    Model,
    logPref,
    filters = {},
    customFind,
  }: ModelCacheParams<Item>) {
    this.logPref = logPref || this.logPref
    this.filters = filters
    this.Model = Model
    this.autoUdatePeriod = autoUdatePeriod || this.autoUdatePeriod
    this.customFind = customFind

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
    let lastUpdate = 0

    while (true) {
      const readyToUpdate = Date.now() - lastUpdate < 1000 * 60

      if (!this.uploadQueue.length || readyToUpdate) {
        await wait(1000 * 60) // 1 min
        continue
      } else {
        lastUpdate = Date.now()
      }

      const queue = this.uploadQueue

      try {
        // clear before upload to be sure that we don't erased some items in the queue
        this.uploadQueue = []
        await this.Model.bulkWrite(queue)

        // Need to avaid the case when items are not in this.items or queue
        const items = await this.fetch()
        this.items = items as unknown as Item[]
        this.needToBeUpdated = false
      } catch (e) {
        // Return candles that failed to upload back to the queue
        this.uploadQueue.push(...queue)
        log.error(this.logPref, 'Failed to upload items', e)
      }
    }
  }

  async fetch() {
    const res = this.customFind
      ? this.customFind(this.filters)
      : // @ts-expect-error
        this.Model.find(this.filters).lean()

    return res
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
        const items = await this.fetch()

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
