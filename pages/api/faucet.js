// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const ethers = require("ethers");
const dayjs = require("dayjs");
const fs = require("fs-extra");
let { provider, chainId, hexPrivateKey, value, ipMax, addressMax } = require("../../faucet.json");
const wallet = new ethers.Wallet(hexPrivateKey, new ethers.JsonRpcProvider(provider));

const db = "./db/";

// const faucetTemplet = {
//   "date": 20220114,
//   "data": ["ip+id+address"]
// }

let faucet = undefined;

const isObj = (object) => {
  return object && typeof object == "object" && Object.prototype.toString.call(object).toLowerCase() == "[object object]";
};

// 确保faucet对象是faucetTemplet格式
const initFaucet = (faucet, date) => {
  if (!isObj(faucet)) {
    faucet = {};
  }
  if (faucet.date == undefined) {
    faucet["date"] = date;
  }
  if (!Array.isArray(faucet["items"])) {
    faucet["items"] = [];
  }
  return faucet;
};

const calcCount = (faucet, ip, id, to) => {
  let ret = { ip: 0, id: 0, to: 0 };
  for (const item of faucet.items) {
    ret.ip += item.includes(ip.toLowerCase()) ? 1 : 0;
    ret.id += item.includes(id.toLowerCase()) ? 1 : 0;
    ret.to += item.includes(to.toLowerCase()) ? 1 : 0;
  }
  return ret;
};

console.log("api/faucet start", provider, chainId, hexPrivateKey, value, ipMax);

export default async function handler(req, res) {
  const { body, headers } = req;
  const { to, id } = body;
  const ip = headers["cf-connecting-ip"] || "127.0.0.1";
  const date = dayjs().format("YYYYMMDD");
  const item = ip.toLowerCase() + "_" + id.toLowerCase() + "_" + to.toLowerCase();
  if (faucet == undefined) {
    try {
      await fs.ensureDir(db);
      faucet = await fs.readJson(db + date + ".json");
    } catch (error) {}
  } else {
    if (faucet.date != date) {
      await fs.writeJSON(db + faucet.date + ".json", faucet);
      faucet = {};
    }
  }
  faucet = initFaucet(faucet, date);

  try {
    const ret = calcCount(faucet, ip, id, to);
    console.log(`date=${date}, ip=${ip}|${ret.ip}, id=${id}|${ret.id}, to=${to}|${ret.to}`);
    if (!ip || !id) {
      return res.status(200).json({ msg: `forbid by the server!`, code: 403 });
    }
    if (ret.to >= addressMax) {
      return res.status(200).json({ msg: `A maximum of ${addressMax} withdrawals per day are allowed`, code: 401 });
    } else if (ret.ip >= ipMax || ret.id >= ipMax) {
      return res.status(200).json({ msg: `One IP address can be received for a maximum of ${ipMax} times a day`, code: 400 });
    }

    const tx = { to, value };

    const response = await wallet.sendTransaction(tx);
    const data = await response.wait();
    faucet.items.push(item);
    await fs.writeJSON(db + faucet.date + ".json", faucet);
    res.status(200).json({ msg: "success", data, code: 0 });
  } catch (error) {
    console.error(error);
    res.status(200).json({ msg: "sendSignedTransaction fail, try", code: 402 });
  }
}
