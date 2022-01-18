// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const Web3 = require('web3')
const dayjs = require("dayjs");
const fs = require("fs-extra")
let { provider, chainId, hexPrivateKey, value, gasPrice, gas, ipMax, addressMax } = require("../../faucet.json")
const web3 = new Web3(provider);
const account = web3.eth.accounts.privateKeyToAccount(hexPrivateKey)
const from = account.address
const db = "./db/"

// const faucetTemplet = {
//   "date": 20220114,
//   "192.168.0.1": {
//     "count": 4,
//     "738792848": {
//       "0x6e355de3fbc1290c5A72D9A9400A0304E2b8a756": 2
//     }
//   }
// }

let faucet = undefined

const isObj = (object) => {
  return object && typeof (object) == 'object' && Object.prototype.toString.call(object).toLowerCase() == "[object object]"
}

// 确保faucet对象是faucetTemplet格式
const initFaucet = (faucet, date, ip, id) => {
  if (!isObj(faucet)) {
    faucet = {}
  }

  if (faucet.date == undefined) {
    faucet["date"] = date
  }
  if (!isObj(faucet[ip])) {
    faucet[ip] = {}
  }
  if (!isObj(faucet[ip][id])) {
    faucet[ip][id] = {}
  }

  if (!Number.isInteger(faucet[ip].count)) {
    faucet[ip]["count"] = 0
  }

  return faucet
}

console.log("api/faucet start", provider, chainId, hexPrivateKey, value, gasPrice, gas, ipMax)

export default async function handler(req, res) {
  const { body, headers } = req
  const { to, id } = body
  const ip = headers['cf-connecting-ip'] || "127.0.0.1"
  const date = dayjs().format("YYYYMMDD")
  console.log(date, ip, id, to)

  if (faucet == undefined) {
    try {
      await fs.ensureDir(db);
      faucet = await fs.readJson(db + date + ".json")
    } catch (error) {
    }
  } else {
    if (faucet.date != date) {
      await fs.writeJSON(db + faucet.date + ".json", faucet)
      faucet = {}
    }
  }
  faucet = initFaucet(faucet, date, ip, id)

  try {
    if (Number.isInteger(faucet[ip][id][to]) && faucet[ip][id][to] >= addressMax) {
      return res.status(200).json({ msg: `A maximum of ${addressMax} withdrawals per day are allowed`, code: 401 })
    } else if (faucet[ip]["count"] >= ipMax) {
      return res.status(200).json({ msg: `One IP address can be received for a maximum of ${ipMax} times a day`, code: 400 })
    }

    const nonce = await web3.eth.getTransactionCount(account.address)
    const message = {
      from, to, gas, gasPrice, nonce, value, chainId
    }
    const transaction = await account.signTransaction(message)
    const data = await web3.eth.sendSignedTransaction(transaction.rawTransaction)
    faucet[ip][id][to] = Number.isInteger(faucet[ip][id][to]) ? faucet[ip][id][to] + 1 : 1
    faucet[ip]["count"] = faucet[ip]["count"] + 1
    await fs.writeJSON(db + faucet.date + ".json", faucet)
    res.status(200).json({ msg: "success", data, code: 0 })
  } catch (error) {
    console.error(error)
    res.status(200).json({ msg: "sendSignedTransaction fail, try", code: 402 })
  }
}
