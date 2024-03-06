# SDK For Smarter Wallet Frond End

MPC key management and build ERC4337 transaction

## Features

- Generate MPC keys
- Save MPC keys
- Build ERC4337 native token trascation
- Build ERC4337 ERC20 token trascation
- Build ERC4337 native token trascation with token pay master
- Build ERC4337 ERC20 token trascation with token pay master

## Installation

To install the package, run the following command:

```bash
npm install sw-fe-sdk
```

## Usage

Before using the package, make sure to import the required modules and configure the necessary variables:

```javascript
import { MPCManageAccount } from 'sw-fe-sdk';
import { JSONBigInt } from 'sw-fe-sdk';
```

### Configuration

Set up the RPC URL and other constants:

```javascript
const rpcUrl = "https://mumbai-rpc.web3idea.xyz"; // Replace with your RPC URL
// ... other constants
```

### Creating an MPC Account

To initialize and use an MPC account, follow these steps:

1. Initialize the account with the given key string:

```javascript
const mpcAccount = new MPCManageAccount(
  rpcUrl, 
  mpcBackendApiUrl, 
  mpcWasmUrl, 
  walletFactoryAddres, 
  authorization, 
  createWalletApiUrl
);

// mpcKeyStr is string, e.g.: '{"Id":1,"ShareI":219499044982805701588892377127447501004150432209403709303384334655408914819632,"PublicKey":{"Curve":"secp256k1","X":97292621653416266750380703637875538596866301353776849812982916816163853412988,"Y":32440693875191451391160231867342089322288044048122424317742935922111154446039},"ChainCode":"013d57fb4dea99754bc3773dedf201f9c555684eab127a529d335663c0063425c9","SharePubKeyMap":{"1":{"Curve":"secp256k1","X":29161051009961544429569809800230777877472024870500305033506395207674118416373,"Y":44796153314212729221467409179106608297103339961871905099986927630538307838333},"2":{"Curve":"secp256k1","X":40713022408703343240041761412242766867715143730321538117446016757996923246685,"Y":54311185172390094674585055235636263490742909410647712991051877387418786801570},"3":{"Curve":"secp256k1","X":36535362237429459090412737650018500331292975515911824642793483191706305761009,"Y":97503616435531946333830622361346685900869373933095170990256609518446036018220}}}'
await mpcAccount.initAccount(mpcKeyStr);
```

2. Calculate the owner address:

```javascript
const ownerAddress = await mpcAccount.getOwnerAddress();
console.log("Owner Address:", ownerAddress);
```

### Transactions

#### Transfer Native Token with token pay master

To build a transaction for transferring native tokens:

```javascript
const gasPrice = await ethersWallet.getGasPrice();
const op = await mpcAccount.buildTxTransferNativeToken(
  entryPointAddress,
  gasPrice,
  "0xRecipientAddress", // Replace with the recipient's address
  ethers.utils.parseEther("Amount"), // Replace with the amount to send
  tokenPaymasterAddress,
  payGasFeeTokenAddress
);
console.log("Transfer native token tx op:", JSONBigInt.stringify(op));
```

#### Transfer Native Token without token pay master

TODO

#### Transfer ERC20 Token with token pay master

To build a transaction for transferring ERC20 tokens:

```javascript
const gasPrice = await ethersWallet.getGasPrice();
const op = await mpcAccount.buildTxTransferERC20Token(
  entryPointAddress,
  gasPrice,
  "0xRecipientAddress", // Replace with the recipient's address
  ethers.utils.parseEther("Amount"), // Replace with the amount to send
  "0xTokenAddress", // Replace with the ERC20 token address
  tokenPaymasterAddress,
  payGasFeeTokenAddress
);
console.log("Transfer ERC20 token tx op:", JSONBigInt.stringify(op));
```

#### Transfer ERC20 Token without token pay master

TODO

## Unit Test

```bash
npm test -- ./test/build-ts.test.ts
npm test -- ./test/mpc-ts.test.ts
```
