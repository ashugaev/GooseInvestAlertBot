import {KucoinAPI} from "@/marketApi/kucoin/index"

export const accountsList = async () => {
  return await KucoinAPI.rest.User.Account.getAccountsList()
}