// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const Web3 = require('web3')
const PouchDB = require("pouchdb");
const dayjs = require("dayjs");
const db = new PouchDB("./pouchdb");
const web3 = new Web3("http://15.223.32.213:6060");
const hexPrivateKey = "7df4c6f61a6b83b3f8e0eb299033d016e077a51162427c1786c53a18cc3b5bd1"; // 0x8888834da5fa77577e8a8e4479f51f7210a5f95e
const account = web3.eth.accounts.privateKeyToAccount(hexPrivateKey)
const value = "10000000000000000000"
const chainId = 101
const gasPrice = 100000000000000
const gas = 41000
const from = account.address
console.log("api/faucet start")

export default async function handler(req, res) {
  const { body, headers } = req
  const { to, id } = body
  const realIp = headers['x-real-ip'] || "127.0.0.1"
  const date = dayjs().format("YYYYMMDD")
  const key = date + "-" + realIp
  console.log(to, id, key, headers['x-real-ip'])
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
  try {
    const nonce = await web3.eth.getTransactionCount(account.address)
    const message = {
      from, to, gas, gasPrice, nonce, value, chainId
    }
    const transaction = await account.signTransaction(message)
    const data = await web3.eth.sendSignedTransaction(transaction.rawTransaction)
    res.status(200).json({ msg: "success", data, code: 0 })
  } catch (error) {
    res.status(200).json({ msg: "sendSignedTransaction fail, try", code: 402 })
  }
}
