// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const Web3 = require('web3')
const PouchDB = require("pouchdb");
const dayjs = require("dayjs");
const db = new PouchDB("./pouchdb");
const web3 = new Web3("http://node.lucq.fun");
const hexPrivateKey = "b5383875512d64281acfb81cc37a95b0ddc00b235a3aa60cf8b4be25a3ba8fe5"; // 0xfffff01adb78f8951aa28cf06ceb9b8898a29f50
const account = web3.eth.accounts.privateKeyToAccount(hexPrivateKey)
const value = "100000000000000000000"
const chainId = 1024
const gasPrice = 1000000000
const gas = 21000
const from = account.address
console.log("api/faucet start")

export default async function handler(req, res) {
  const { body, headers } = req
  const { to, id } = body
  const realIp = headers['x-real-ip'] || "127.0.0.1"
  const date = dayjs().format("YYYYMMDD")
  const key = date + "-" + realIp
  console.log(to, id, key, headers['x-real-ip'])
  if(!to || !id) {
    return res.status(200).json({ msg: "Parameters are missing", code: 402 })
  }
  try {
    const info = await db.get(key);
    // console.log(info)
    const accounts = info.accounts.split("_")
    if (info.accounts.indexOf(to.toLowerCase()) >= 0 || info.accounts.indexOf(id) >= 0) {
      return res.status(200).json({ msg: "A maximum of 1 withdrawals per day are allowed", code: 401 })
    } else if (accounts.length >= 10) {
      return res.status(200).json({ msg: "One IP address can be received for a maximum of 10 times a day", code: 400 })
    }
    await db.put({
      _id: info._id,
      _rev: info._rev,
      accounts: info.accounts + "_" + to.toLowerCase() + ":" + id
    });
  } catch (error) {
    await db.put({ _id: key, accounts: to.toLowerCase() + ":" + id });
  }

  const nonce = await web3.eth.getTransactionCount(account.address)
  const message = {
    from, to, gas, gasPrice, nonce, value, chainId
  }
  const transaction = await account.signTransaction(message)
  const data = await web3.eth.sendSignedTransaction(transaction.rawTransaction)
  res.status(200).json({ msg: "success", data, code: 0 })
}
