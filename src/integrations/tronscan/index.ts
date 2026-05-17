import axios from 'axios'

/**
 * {
 *   "contract_map": {
 *     "TKJZwhq98wdYxpqxySYaTbwZkNp2vMtVhW": false,
 *     "TNXoiAJ3dct8Fjg4M9fkLFh9S2v9TXc32G": false,
 *     "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t": true
 *   },
 *   "contractRet": "SUCCESS",
 *   "data": "",
 *   "contractInfo": {
 *     "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t": {
 *       "isToken": true,
 *       "tag1": "USDT Token",
 *       "tag1Url": "https://tron.network/usdt",
 *       "name": "TetherToken",
 *       "risk": false,
 *       "vip": true
 *     }
 *   },
 *   "contractType": 31,
 *   "event_count": 1,
 *   "project": "",
 *   "toAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
 *   "confirmed": true,
 *   "trc20TransferInfo": [
 *     {
 *       "icon_url": "https://static.tronscan.org/production/logo/usdtlogo.png",
 *       "symbol": "USDT",
 *       "level": "2",
 *       "to_address": "TKJZwhq98wdYxpqxySYaTbwZkNp2vMtVhW",
 *       "contract_address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
 *       "type": "Transfer",
 *       "decimals": 6,
 *       "name": "Tether USD",
 *       "vip": true,
 *       "tokenType": "trc20",
 *       "from_address": "TNXoiAJ3dct8Fjg4M9fkLFh9S2v9TXc32G",
 *       "amount_str": "12000000",
 *       "status": 0
 *     }
 *   ],
 *   "transfersAllList": [
 *     {
 *       "icon_url": "https://static.tronscan.org/production/logo/usdtlogo.png",
 *       "symbol": "USDT",
 *       "level": "2",
 *       "to_address": "TKJZwhq98wdYxpqxySYaTbwZkNp2vMtVhW",
 *       "contract_address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
 *       "type": "Transfer",
 *       "decimals": 6,
 *       "name": "Tether USD",
 *       "vip": true,
 *       "tokenType": "trc20",
 *       "from_address": "TNXoiAJ3dct8Fjg4M9fkLFh9S2v9TXc32G",
 *       "amount_str": "12000000",
 *       "status": 0
 *     }
 *   ],
 *   "block": 61393765,
 *   "triggerContractType": 500,
 *   "riskTransaction": false,
 *   "timestamp": 1714824099000,
 *   "info": {},
 *   "normalAddressInfo": {
 *     "TKJZwhq98wdYxpqxySYaTbwZkNp2vMtVhW": {
 *       "risk": false
 *     },
 *     "TNXoiAJ3dct8Fjg4M9fkLFh9S2v9TXc32G": {
 *       "risk": false
 *     },
 *     "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t": {
 *       "risk": false
 *     }
 *   },
 *   "cost": {
 *     "multi_sign_fee": 0,
 *     "net_fee": 0,
 *     "energy_penalty_total": 17245,
 *     "net_fee_cost": 1000,
 *     "energy_usage": 31895,
 *     "fee": 0,
 *     "energy_fee_cost": 420,
 *     "energy_fee": 0,
 *     "energy_usage_total": 31895,
 *     "memoFee": 0,
 *     "origin_energy_usage": 0,
 *     "net_usage": 345
 *   },
 *   "addressTag": {
 *     "TNXoiAJ3dct8Fjg4M9fkLFh9S2v9TXc32G": "Binance-Hot 4"
 *   },
 *   "revert": false,
 *   "confirmations": 33399,
 *   "fee_limit": 30000000,
 *   "tokenTransferInfo": {
 *     "icon_url": "https://static.tronscan.org/production/logo/usdtlogo.png",
 *     "symbol": "USDT",
 *     "level": "2",
 *     "to_address": "TKJZwhq98wdYxpqxySYaTbwZkNp2vMtVhW",
 *     "contract_address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
 *     "type": "Transfer",
 *     "decimals": 6,
 *     "name": "Tether USD",
 *     "vip": true,
 *     "tokenType": "trc20",
 *     "from_address": "TNXoiAJ3dct8Fjg4M9fkLFh9S2v9TXc32G",
 *     "amount_str": "12000000",
 *     "status": 0
 *   },
 *   "contract_type": "trc20",
 *   "trigger_info": {
 *     "method": "transfer(address _to,uint256 _value)",
 *     "parameter": {
 *       "_value": "12000000",
 *       "_to": "TKJZwhq98wdYxpqxySYaTbwZkNp2vMtVhW"
 *     },
 *     "methodId": "a9059cbb",
 *     "contract_address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
 *     "call_value": 0
 *   },
 *   "signature_addresses": [],
 *   "ownerAddress": "TNXoiAJ3dct8Fjg4M9fkLFh9S2v9TXc32G",
 *   "srConfirmList": [
 *     {
 *       "address": "TCEo1hMAdaJrQmvnGTCcGT2LqrGU4N7Jqf",
 *       "name": "TRONScan",
 *       "block": 61393765,
 *       "url": "https://tronscan.org"
 *     },
 *     {
 *       "address": "TWkpg1ZQ4fTv7sj41zBUTMo1kuJEUWTere",
 *       "name": "TRONLink",
 *       "block": 61393766,
 *       "url": "https://tronlink.org"
 *     },
 *     {
 *       "address": "TBsyKdNsCKNXLgvneeUJ3rbXgWSgk6paTM",
 *       "name": "StakedTron",
 *       "block": 61393767,
 *       "url": "https://staked.us"
 *     },
 *     {
 *       "address": "TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH",
 *       "name": "Binance Staking",
 *       "block": 61393768,
 *       "url": "https://www.binance.com/en/staking"
 *     },
 *     {
 *       "address": "TCZvvbn4SCVyNhCAt1L8Kp1qk5rtMiKdBB",
 *       "name": "Crypto Labs",
 *       "block": 61393769,
 *       "url": "CryptoLabs"
 *     },
 *     {
 *       "address": "TGyrSc9ZmTdbYziuk1SKEmdtCdETafewJ9",
 *       "name": "Luganodes",
 *       "block": 61393770,
 *       "url": "https://luganodes.com"
 *     },
 *     {
 *       "address": "TMafrJCuNoYq3mg9dDThfg7c9VP6enZN6j",
 *       "name": "metaverse home",
 *       "block": 61393771,
 *       "url": "metaversehome"
 *     },
 *     {
 *       "address": "TJBtdYunmQkeK5KninwgcjuK1RPDhyUWBZ",
 *       "name": "JD Investment",
 *       "block": 61393772,
 *       "url": "JDinvestment"
 *     },
 *     {
 *       "address": "TJvaAeFb8Lykt9RQcVyyTFN2iDvGMuyD4M",
 *       "name": "Poloniex",
 *       "block": 61393773,
 *       "url": "https://poloniex.com/"
 *     },
 *     {
 *       "address": "TQ4bh4nQknQp33vuf1mUAKu5M5TWW8cTAD",
 *       "name": "Intelligence Quant",
 *       "block": 61393774,
 *       "url": "IntelligenceQuant"
 *     },
 *     {
 *       "address": "TDpt9adA6QidL1B1sy3D8NC717C6L5JxFo",
 *       "name": "Chain Cloud",
 *       "block": 61393775,
 *       "url": "chaincloud"
 *     },
 *     {
 *       "address": "TAAdjpNYfeJ2edcETNpad1QpQWJfyBdB9V",
 *       "name": "Ant Investment Group",
 *       "block": 61393776,
 *       "url": "antinvestmentgroup"
 *     },
 *     {
 *       "address": "TN2W4cc7a4dsYyTLiLMWa9m7jVpdLjGvYs",
 *       "name": "Huobi_Wallet",
 *       "block": 61393777,
 *       "url": "https://www.huobiwallet.com/"
 *     },
 *     {
 *       "address": "TNaJADoq1u2atryP1ZzwvmEE4ZBELXfMqw",
 *       "name": "callmeSR",
 *       "block": 61393778,
 *       "url": "http://zempty.peiwo.cn/"
 *     },
 *     {
 *       "address": "TC6qGw3d6h25gjcM64KLuZn1cznNi5NR6t",
 *       "name": "Crypto Innovation Fund",
 *       "block": 61393779,
 *       "url": "cryptoinnovationfund"
 *     },
 *     {
 *       "address": "TVFKwzE8qeETLaZEHMx2tjEsdnujAgAWaA",
 *       "name": "BlockchainOrg",
 *       "block": 61393780,
 *       "url": "http://blockchain.org"
 *     },
 *     {
 *       "address": "TTW663tQYJTTCtHh6DWKAfexRhPMf2DxQ1",
 *       "name": "TRONALLIANCE",
 *       "block": 61393781,
 *       "url": "http://tronalliance.org"
 *     },
 *     {
 *       "address": "TSMC4YzUSfySfqKuFnJbYyU3W6PBebBk2E",
 *       "name": "Smart Consensus",
 *       "block": 61393782,
 *       "url": "SmartConsensus"
 *     },
 *     {
 *       "address": "TGJBjL8wmRVyRStkghnhcVNYYgn6Yjno6X",
 *       "name": "BlockAnalysis",
 *       "block": 61393783,
 *       "url": "blockanalysis"
 *     }
 *   ],
 *   "hash": "e046c2bb63fa65a4a3d94228fd8fd87e1fb0c2ffa3780ef722846c532c326b0a",
 *   "contractData": {
 *     "data": "a9059cbb...<truncated trc20 transfer payload>...",
 *     "owner_address": "TNXoiAJ3dct8Fjg4M9fkLFh9S2v9TXc32G",
 *     "contract_address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
 *   },
 *   "internal_transactions": {}
 * }
 * @param transactionId
 */

interface TronScanCheckTransactionResponse {
  trc20TransferInfo: {
    symbol: string
    amount_str: string
    to_address: string
    contract_address: string
    from_address: string
  }[]
  timestamp: number
  confirmed: boolean
}
export const tronScanCheckTransaction = async (
  transactionId: string
): Promise<TronScanCheckTransactionResponse> => {
  const response = await axios(
    `https://apilist.tronscanapi.com/api/transaction-info?hash=${transactionId}`,
    {
      headers: {
        'TRON-PRO-API-KEY': process.env.TRONSCAN_API_KEY,
      },
    }
  )
  const data = await response.data
  return data as TronScanCheckTransactionResponse
}
