import { getModelForClass, pre, prop } from '@typegoose/typegoose' // eslint-disable-line unused-imports/no-unused-imports
import { TelegrafContext } from 'telegraf/typings/context'

import { waitForMongoConnection } from '@/db/mongoose'
import { log } from '@/helpers'
import { wait } from '@/helpers/wait'

import { EMarketDataSources } from '../marketApi/types'
import { EMarketInstrumentTypes } from './InstrumentsList'

const logPrefix = '[PRICE UPDATER]'

@pre(['find', 'count'], function () {
  const filters = this.getFilter()

  filters.triggered === undefined && this.where('triggered').equals(false)

  filters.removed === undefined && this.where('removed').equals(false)
})
export class PriceAlert {
  _id?: string

  /**
   * Id used to look up price data (decoupled from the ticker name)
   */
  @prop({ required: true })
  tickerId: string

  @prop({ required: false })
  user?: number

  @prop({ required: false })
  chat: number | null

  @prop({ required: true })
  symbol: string

  @prop({ required: false })
  lowerThen?: number

  @prop({ required: false })
  greaterThen?: number

  @prop({ required: false })
  message?: string

  @prop({ required: true })
  name: string

  @prop({ required: false })
  currency?: string

  // Effectively required, but there is a pool of alerts created before this field was added
  @prop()
  type: EMarketInstrumentTypes

  // Effectively required, but there is a pool of alerts created before this field was added
  @prop()
  source: EMarketDataSources

  /**
   * Price at the moment of alert creation
   */
  @prop()
  initialPrice: number

  /**
   * Bot id for send alert
   * Mylti bot support
   */
  @prop({ required: true })
  botId: number

  /**
   * Whether the alert has been triggered
   */
  @prop({ required: true, default: false })
  triggered?: boolean

  /**
   * Alert is removed
   */
  @prop({ required: true, default: false })
  removed?: boolean

  @prop({ required: false, default: false })
  createdAsACopy?: boolean

  createdAt?: Date
  updatedAt?: Date
}

// Get PriceAlertModel model
export const PriceAlertModel = getModelForClass(PriceAlert, {
  schemaOptions: { timestamps: true },
  options: {
    customName: 'priceAlerts',
  },
})

/**
 * Class for hancle price alerts cache
 */
class PriceAlertCache {
  constructor() {
    this.init()
  }

  items = []
  isReady = false
  needToBeUpdated = true // allows to enforce update

  update() {
    this.needToBeUpdated = true
  }

  init = async () => {
    this.setupUpdater()
  }

  /**
   * Updates items list every 'waitTime' ms
   */
  setupUpdater = async () => {
    const waitTime = 180000 // 3 min
    let timerId: NodeJS.Timeout

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // skip iterations untill needToBeUpdated is true
      if (!this.needToBeUpdated) {
        await wait(1000) // 1 sec
        continue
      }

      try {
        await waitForMongoConnection('price alerts cache updater')

        const items = await PriceAlertModel.find({
          removed: false,
          triggered: false,
        }).lean()
        this.items = items as unknown as PriceAlert[]
        this.needToBeUpdated = false
        this.isReady = true
        log.info(logPrefix, 'Items prices updated')
      } catch (e) {
        log.error(logPrefix, 'Items update crashed', e)
      } finally {
        clearTimeout(timerId)
        timerId = setTimeout(() => {
          this.needToBeUpdated = true
        }, waitTime)
      }
    }
  }

  get get() {
    return this.items
  }

  getForUser(user: number) {
    if (!user) {
      throw new Error('User is not defined')
    }

    return this.items.filter((item) => item.user === user)
  }

  getForChat(chat: number) {
    if (!chat) {
      throw new Error('chat is not defined')
    }

    return this.items.filter((item) => item.chat === chat)
  }

  byTickerId(
    tickerId: string,
    botId: number,
    user?: number,
    chat?: number
  ): PriceAlert[] {
    return chat
      ? this.items.filter(
          (item) =>
            item.tickerId === tickerId &&
            item.chat === chat &&
            item.botId === botId
        )
      : this.items.filter(
          (item) =>
            item.tickerId === tickerId &&
            item.user === user &&
            item.botId === botId
        )
  }

  byId(_id: string): PriceAlert | undefined {
    return this.items.find((item) => item._id === _id)
  }

  removeItemFromCache = (_id: string) => {
    const id = _id.toString()
    this.items = this.items
      .filter((item) => item._id.toString() !== id)
      .filter((item) => item.triggered === false && item.removed === false)
    this.needToBeUpdated = true
  }
}

export const priceAlertCache = new PriceAlertCache()

export const addPriceAlerts = async (
  newAlerts: PriceAlert[]
): Promise<PriceAlert[]> => {
  const normalizedAlerts = newAlerts.map((alert) => ({
    ...alert,
    symbol: alert.symbol.toUpperCase(),
  }))

  const items = await PriceAlertModel.insertMany(normalizedAlerts)
  priceAlertCache.update()

  return items
}

/**
 * Internal helper for housekeeping operations
 */
export async function getAllAlerts(): Promise<PriceAlert[]> {
  try {
    const alerts = await PriceAlertModel.find({})

    return alerts
  } catch (e) {
    throw new Error(e)
  }
}

export async function removePriceAlert({
  symbol,
  _id,
  user,
  chat,
  triggered,
  removed,
}: Partial<
  Pick<PriceAlert, 'symbol' | '_id' | 'user' | 'chat' | 'triggered' | 'removed'>
>): Promise<number> {
  // eslint-disable-next-line no-async-promise-executor
  return await new Promise(async (resolve, reject) => {
    if (!_id && !user && !chat) {
      reject('Not all params are defined')
      return
    }

    try {
      const searchParams: Partial<PriceAlert> = {
        chat,
      }

      triggered && (searchParams.triggered = false)
      removed && (searchParams.removed = false)
      symbol && (searchParams.symbol = symbol.toUpperCase())
      user && (searchParams.user = user)
      // @ts-ignore
      _id && (searchParams._id = _id)

      if (!Object.keys(searchParams).length) {
        reject('No parameters provided')
        return
      }

      const { nModified } = await PriceAlertModel.updateMany(searchParams, {
        $set: {
          removed: removed ? true : false,
          triggered: triggered ? true : false,
        },
      })

      _id && priceAlertCache.removeItemFromCache(_id.toString())
      priceAlertCache.update()

      resolve(nModified)
    } catch (e) {
      reject(e)
    }
  })
}

// Returns the array of triggered alerts
export async function updateAlert({
  _id,
  data,
}: {
  _id: string
  data: { message: string }
}): Promise<{ nModified: number }> {
  // eslint-disable-next-line
  return await new Promise(async (rs, rj) => {
    try {
      const result = await PriceAlertModel.update({ _id }, { $set: data })
      priceAlertCache.update()

      rs(result as { nModified: number })
    } catch (e) {
      rj(e)
    }
  })
}

export const alertByTickerIdFromCache = async (
  tickerId: string,
  user: number | null,
  chat: number,
  ctx: TelegrafContext
): Promise<PriceAlert[]> => {
  let alerts = []
  const botId = ctx.goose.id

  if (chat) {
    alerts = priceAlertCache.byTickerId(tickerId, botId, undefined, chat)
  } else if (user) {
    alerts = priceAlertCache.byTickerId(tickerId, botId, user)
  } else {
    throw new Error('User or chat is not defined')
  }

  if (!alerts.length) {
    alerts = chat
      ? await PriceAlertModel.find({
          tickerId: tickerId,
          chat,
          triggered: false,
          removed: false,
        }).lean()
      : await PriceAlertModel.find({
          tickerId: tickerId,
          user,
          triggered: false,
          removed: false,
        }).lean()
  }

  return alerts
}
