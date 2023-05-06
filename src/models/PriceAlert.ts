import { getModelForClass, prop } from '@typegoose/typegoose' // eslint-disable-line unused-imports/no-unused-imports

import { log } from '@/helpers'
import { wait } from '@/helpers/wait'

import { EMarketDataSources } from '../marketApi/types'
import { EMarketInstrumentTypes } from './InstrumentsList'

const logPrefix = '[PRICE UPDATER]'

export class PriceAlert {
  _id?: string

  /**
   * Id по по которому ищем данные о цене (отвязываемся от названия тикера)
   */
  @prop({ required: true })
    tickerId: string

  @prop({ required: false })
    user?: number

  @prop({ required: false })
    chat?: number

  @prop({ required: true })
    symbol: string

  @prop({required: false})
    lowerThen?: number

  @prop({required: false})
    greaterThen?: number

  @prop({required: false})
    message?: string

  @prop({ required: true })
    name: string

  @prop({ required: false })
    currency?: string

  // Вообще обязательное поле, но есть пулл алертов, которые были созданы до его появления
  @prop()
    type: EMarketInstrumentTypes

  // Вообще обязательное поле, но есть пулл алертов, которые были созданы до его появления
  @prop()
    source: EMarketDataSources

  /**
     * Цена на момент создания алерта
     */
  @prop()
    initialPrice: number

  /**
   * Bot id for send alert
   * Mylti bot support
   */
  @prop({required: true})
    botId: number
}

// Get PriceAlertModel model
export const PriceAlertModel = getModelForClass(PriceAlert, {
  schemaOptions: { timestamps: true },
  options: {
    customName: 'priceAlerts'
  }
})

/**
 * Class for hancle price alerts cache
 */
class PriceAlertCache {
  constructor () {
    this.init()
  }

  items = []
  isReady = false
  needToBeUpdated = true // allows to enforce update

  update () {
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

    while (true) {
      // skip iterations untill needToBeUpdated is true
      if (!this.needToBeUpdated) {
        await wait(1000) // 1 sec
        continue
      }

      try {
        const items = await PriceAlertModel.find().lean()
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

  get get () {
    return this.items
  }

  getForUser (user: number) {
    if (!user) {
      throw new Error('User is not defined')
    }

    return this.items.filter(item => item.user === user)
  }

  getForChat (chat: number) {
    if (!chat) {
      throw new Error('chat is not defined')
    }

    return this.items.filter(item => item.chat === chat)
  }

  byTickerId (tickerId: string, user?: number, chat?: number): PriceAlert[] {
    return chat 
      ? this.items.filter(item => (item.tickerId === tickerId && item.chat === chat))
      : this.items.filter(item => (item.tickerId === tickerId && item.user === user))
  }

  byId (_id: string): PriceAlert | undefined {
    return this.items.find(item => item._id === _id)
  }

  removeItemFromCache = (_id: string) => {
    const id = _id.toString()
    this.items = this.items.filter(item => item._id.toString() !== id)
    this.needToBeUpdated = true
  }
}

export const priceAlertCache = new PriceAlertCache()

export const addPriceAlerts = async (newAlerts: PriceAlert[]): Promise<PriceAlert[]> => {
  const normalizedAlerts = newAlerts.map(alert => ({
    ...alert,
    symbol: alert.symbol.toUpperCase()
  }))

  const items = await PriceAlertModel.insertMany(normalizedAlerts)
  priceAlertCache.update()

  return items
}

export async function getAllAlerts (): Promise<PriceAlert[]> {
  try {
    const alerts = await PriceAlertModel.find({})

    return alerts
  } catch (e) {
    throw new Error(e)
  }
}

export async function removePriceAlert (
  { symbol, _id, user }: Partial<Pick<PriceAlert, 'symbol' | '_id' | 'user'>>
): Promise<number> {
  // eslint-disable-next-line no-async-promise-executor
  return await new Promise(async (resolve, reject) => {
    try {
      const params: Partial<PriceAlert> = {}

      symbol && (params.symbol = symbol.toUpperCase())
      user && (params.user = user)
      _id && (params._id = _id)

      if (!Object.keys(params).length) {
        reject('Не указанны параметры')
        return
      }

      const { deletedCount } = await PriceAlertModel.deleteMany(params)
      priceAlertCache.update()

      resolve(deletedCount)
    } catch (e) {
      reject(e)
    }
  })
}

// Вернет массив сработавших алертов
export async function updateAlert ({ _id, data }: { _id: string, data: { message: string } }): Promise<any> {
  // eslint-disable-next-line
  return await new Promise(async (rs, rj) => {
    try {
      const result = await PriceAlertModel.update({ _id }, { $set: data })
      priceAlertCache.update()

      rs(result)
    } catch (e) {
      rj(e)
    }
  })
}

interface GetAlertsCountForUserParams {
  user: number
}

// eslint-disable-next-line
export const getAlertsCountForUser = async (user: number) => await new Promise(async (rs, rj) => {
  try {
    const params: GetAlertsCountForUserParams = { user }
    const alertsCount = await PriceAlertModel.find(params).count()

    rs(alertsCount)
  } catch (e) {
    rj(e)
  }
})

export const alertByTickerIdFromCache = async (tickerId: string, user: number | null, chat: number): Promise<PriceAlert[]> => {
  let alerts = []
  
  if(chat) {
    alerts = priceAlertCache.byTickerId(tickerId, undefined, chat)
  } else if(user) {
    alerts = priceAlertCache.byTickerId(tickerId, user)
  } else {
    throw new Error('User or chat is not defined')
  }
  
  if (!alerts.length) {
    alerts = chat 
      ? (await PriceAlertModel.find({ tickerId: tickerId, chat }).lean())
      : (await PriceAlertModel.find({ tickerId: tickerId, user }).lean())
  }

  return alerts
}

export const alertByIdFromCache = async (_id: string): Promise<PriceAlert | undefined> => {
  let alert = await priceAlertCache.byId(_id)

  if (!alert) {
    alert = (await PriceAlertModel.find({ _id }).lean())[0]
  }

  return alert
}
