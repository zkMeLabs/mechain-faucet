# Overview

In the testnet mechain native token ME have no market value, they can be obtained for free and are meant for testing purposes only.

mechain network faucets provide native token ME to legitimate developers willing to deploy and test contracts. The faucets also prevent malicious actors from obtaining large amounts of native token ME.

## Deploy

- Install Node.js, version v20.x.
- Execute `yarn` in the project directory to install dependencies.
- Execute `yarn build` in the project directory to build static file.
- Execute `npm i pm2 -g` install pm2.
- Execute `copy faucet.default.json faucet.json` then config faucet.json.
  - provider: rpc provider
  - chainId: chain chain id
  - hexPrivateKey: hex private key, without prefix '0x', for example: f78a136930ce63791ea6ea10072986d8c3f16a6821f6a2583b0787c45086f769
  - value: each time the user retrieves an amount from the faucet, in units of wei
  - ipMax: The number of times a single IP address can claim per day.
  - addressMax: The number of times a single account address can claim per day.
- Execute `pm2 start npm --name "faucet" -- start` start the service.
- On nginx, forward requests for the domain <https://devnet-faucet.mechain.tech/> to <http://127.0.0.1:4001>.
