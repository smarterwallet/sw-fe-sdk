# SDK For Smarter Wallet Frond End

MPC key management and build ERC4337 transaction

## Features

- [x] Generate MPC keys
- [x] Save MPC keys
- [x] Build ERC4337 native token trascation
- [x] Build ERC4337 ERC20 token trascation
- [x] Build ERC4337 native token trascation with token pay master
- [x] Build ERC4337 ERC20 token trascation with token pay master

## Installation

To install the package, run the following command:

For production environment:

```bash
# latest
npm install sw-fe-sdk
```

For test environment:

```bash
# beta
npm install sw-fe-sdk@beta
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
const mpcAccount = new MPCManageAccount(blockchainRpcUrl, mpcBackendApiUrl, mpcWasmUrl, authorization, createWalletApiUrl);
```

### Create MPC Account

Create MPC keys when register wallet, follow these steps:

```javascript
await mpcAccount.initAccount("");

// Generate MPC keys
const mpckeys = await mpcAccount.generateKeys()
console.log("mpckeys:", JSONBigInt.stringify(mpckeys));
// Save to local...
// Save to decenterlized server...
// Save to Smarter wallet server...
```

### Initialize MPC Account

To initialize and use an MPC account, follow these steps:

#### 1. Initialize the account with the given key string

```javascript
// mpcKeyStr is a string, one of mpckeys. e.g.: '{"Id":1,"ShareI":219499044982805701588892377127447501004150432209403709303384334655408914819632,"PublicKey":{"Curve":"secp256k1","X":97292621653416266750380703637875538596866301353776849812982916816163853412988,"Y":32440693875191451391160231867342089322288044048122424317742935922111154446039},"ChainCode":"013d57fb4dea99754bc3773dedf201f9c555684eab127a529d335663c0063425c9","SharePubKeyMap":{"1":{"Curve":"secp256k1","X":29161051009961544429569809800230777877472024870500305033506395207674118416373,"Y":44796153314212729221467409179106608297103339961871905099986927630538307838333},"2":{"Curve":"secp256k1","X":40713022408703343240041761412242766867715143730321538117446016757996923246685,"Y":54311185172390094674585055235636263490742909410647712991051877387418786801570},"3":{"Curve":"secp256k1","X":36535362237429459090412737650018500331292975515911824642793483191706305761009,"Y":97503616435531946333830622361346685900869373933095170990256609518446036018220}}}'
await mpcAccount.initAccount(mpcKeyStr);
```

#### 2. Calculate owner address

```javascript
const ownerAddress = await mpcAccount.getOwnerAddress();
console.log("Owner Address:", ownerAddress);
```

#### 3. Calculate contract wallet address

```javascript
const walletFactoryAddres = 'walletFactoryAddres';
const walletAddress = await ContractWalletUtils.calcContractWalletAddress(blockchainRpcUrl, await mpcAccount.getOwnerAddress(), walletFactoryAddres, 0);
```

#### 4. Deploy your wallet

```javascript
await mpcAccount.deployContractWalletIfNotExist(walletAddress);
```

#### 5. Modify blockchain RPC url

```javascript
mpcAccount.setBlockchainRpc(newRpcUrl);
```

### Transactions

#### Transfer Native Token with token pay master

To build a transaction for transferring native tokens with token pay master:

```javascript
const op = await mpcAccount.buildTxTransferNativeToken(
  walletAddress,
  entryPointAddress,
  await ethersWallet.getGasPrice(),
  "0xRecipientAddress", // Replace with the recipient's address
  ethers.utils.parseEther("Amount"), // Replace with the amount to send
  tokenPaymasterAddress,
  payGasFeeTokenAddress
);
console.log("Transfer native token tx op:", JSONBigInt.stringify(op));
```

#### Transfer Native Token without token pay master

To build a transaction for transferring native tokens without token pay master:

```javascript
const op = await mpcAccount.buildTxTransferNativeToken(
  walletAddress,
  entryPointAddress,
  await ethersWallet.getGasPrice(),
  "0xRecipientAddress", // Replace with the recipient's address
  ethers.utils.parseEther("Amount") // Replace with the amount to send
);
console.log("Transfer native token tx op:", JSONBigInt.stringify(op));
```

#### Transfer ERC20 Token with token pay master

To build a transaction for transferring ERC20 tokens with token pay master:

```javascript
const op = await mpcAccount.buildTxTransferERC20Token(
  walletAddress,
  entryPointAddress,
  await ethersWallet.getGasPrice(),
  "0xRecipientAddress", // Replace with the recipient's address
  ethers.utils.parseEther("Amount"), // Replace with the amount to send
  "0xTokenAddress", // Replace with the ERC20 token address
  tokenPaymasterAddress,
  payGasFeeTokenAddress
);
console.log("Transfer ERC20 token tx op:", JSONBigInt.stringify(op));
```

#### Transfer ERC20 Token without token pay master

To build a transaction for transferring ERC20 tokens without token pay master:

```javascript
const op = await mpcAccount.buildTxTransferERC20Token(
  walletAddress,
  entryPointAddress,
  await ethersWallet.getGasPrice(),
  "0xRecipientAddress", // Replace with the recipient's address
  ethers.utils.parseEther("Amount"), // Replace with the amount to send
  "0xTokenAddress" // Replace with the ERC20 token address
);
console.log("Transfer ERC20 token tx op:", JSONBigInt.stringify(op));
```

The full test code is [here](https://github.com/smarterwallet/sw-fe-sdk/tree/dev/src/test).

## Unit Test

```bash
npm test -- ./test/build-ts.test.ts
npm test -- ./test/mpc-ts.test.ts
```