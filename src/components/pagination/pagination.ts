import { Context, Extra, Markup, Telegraf } from 'telegraf'
import { ExtraEditMessage } from 'telegraf/typings/telegram-types'

import { commandWrapper } from '@/helpers/commandWrapper'
import { triggerActionRegexp } from '@/helpers/triggerActionRegexp'
import { paginationButtons } from '@/keyboards/paginationButtons'

interface GetPaginationModuleParams {
  page: number
  items: {
    id: number | string
    title: string
    [key: string]: any
  }[]
  // action: string
  itemsPerPage?: number
  title: string
}

export interface PaginationParams {
  itemsPerPage: number
  title: string
  getItems: () => Promise<
    { id: number | string; title: string; [key: string]: any }[]
  >
}

export class Pagination {
  itemsPerPage: number
  title: string
  getItems: () => Promise<{ id: number | string; title: string }[]>
  actionKey: string
  messageId?: number

  constructor({ itemsPerPage, title, getItems }: PaginationParams) {
    this.itemsPerPage = itemsPerPage
    this.title = title
    this.getItems = getItems
    // random string
    this.actionKey = Math.random().toString(36).substring(7)
  }

  /**
   * Initial send keyboard
   */
  send = async (ctx: Context, page = 0) => {
    const items = await this.getItems()

    const text = getPaginationText({
      page,
      items,
      itemsPerPage: this.itemsPerPage,
      title: this.title,
    })

    const keyboard = Markup.inlineKeyboard([
      paginationButtons({
        itemsPerPage: this.itemsPerPage,
        itemsLength: items.length,
        // @ts-ignore
        action: this.actionKey,
        payload: {
          p: page,
        },
      }),
    ])

    if (this.messageId) {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        this.messageId,
        undefined,
        text,
        Extra.HTML(true).markup(keyboard) as ExtraEditMessage
      )
    } else {
      const message = await ctx.replyWithHTML(
        text,
        Extra.HTML(true).markup(keyboard) as ExtraEditMessage
      )

      this.messageId = message.message_id
    }
  }

  private handleAction = commandWrapper(
    { availableForAdmins: true, availableForUsers: true },
    async (ctx) => {
      const { p: page } = JSON.parse(ctx.match[1])

      await this.send(ctx, page)
    }
  )

  initActions({ bot }: { bot: Telegraf<Context> }) {
    bot.action(triggerActionRegexp(this.actionKey), this.handleAction)
  }
}

export const getPaginationText = ({
  page,
  items,
  itemsPerPage,
  title,
}: GetPaginationModuleParams) => {
  let text = title + '\n\n'

  const itemsByPage = items.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  )

  itemsByPage.forEach((item, i) => {
    text += `${i + 1 + page * itemsPerPage}. ${item.title}\n\n`
  })

  return text
}
