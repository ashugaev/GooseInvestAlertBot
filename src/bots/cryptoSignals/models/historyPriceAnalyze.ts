import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose'

import { SignalChat } from '@/bots/cryptoSignals/models/signalChat'
import { GetTicksResult } from '@/marketApi/binance/api/tradeByHistory/tradeByHistory'

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class HistoryPriceAnalyze implements Omit<GetTicksResult, 'ticks'> {
  @prop()
  isSLTriggered: boolean

  @prop()
  isTPTriggered: boolean

  @prop()
  isTradeSuccessfullyFinished: boolean

  @prop()
  signalMessageTradeStartPrice: number

  @prop()
  tradeTPExpectingPrice: number

  @prop()
  tradeSLExpectingPrice: number

  @prop()
  isNotEnougthDataForCheck: boolean

  @prop()
  tradeTPTriggeredDate: Date

  @prop()
  tradeSLTriggeredDate: Date

  @prop()
  tradeStartDate: Date

  @prop({ required: true, ref: () => SignalChat })
  chat: Ref<SignalChat>

  @prop({ required: true })
  message: string

  @prop({ required: true })
  messageId: number

  // @prop({ required: true, ref: () => SignalAiRecognize })
  // aiAnswer: Ref<SignalAiRecognize>

  @prop({ required: true })
  signalMessageDate: Date

  @prop({ required: true })
  parsedData: Record<any, any>

  @prop({ required: true })
  tpPrice: number

  @prop({ required: true })
  tpDate: Date

  @prop({ required: true })
  slPrice: number

  @prop({ required: true })
  slDate: Date

  @prop({ required: false })
  status?: string

  /**
   * If tp or sl wasn't triggered during N days
   */
  @prop({ required: true })
  isSkippedBecauseOfPeriod: boolean

  /**
   * Start price was found in signal message or not
   * If not, we can detect it by date of message
   */
  @prop({ required: true })
  isStartPriceDetectedByDate: boolean

  /**
   * Price whet message sent
   */
  @prop({ required: true })
  tradeStartDatePrice: number

  @prop({ required: true })
  ignoreSignalsWithoutTPSL: boolean

  @prop({ required: true })
  manualInputPercentAsFallbackForLackOfSignalTPSL: boolean

  @prop({ required: true })
  manualInputPercentOverrideSignalPrice: boolean

  @prop({ required: true })
  TPwasAutoCalculated: boolean

  @prop({ required: true })
  SLwasAutoCalculated: boolean

  @prop({ required: true })
  manualInputTPPercent: number

  @prop({ required: true })
  manualInputSLPercent: number

  @prop({ required: true })
  firstAfterMessagePrice: number

  @prop({ required: true })
  tradingViewChartlint: string

  @prop({ required: true })
  tradingViewPineScrpt: string

  @prop({ required: true })
  inputDataInvalid: boolean
}

export const HistoryPriceAnalyzeModel = getModelForClass(HistoryPriceAnalyze)
