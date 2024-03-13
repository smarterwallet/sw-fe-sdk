import { ethers } from 'ethers';
import { MPCManageAccount } from '../account/MPCManageAccount';
import { JSONBigInt } from '../mpc/CommonUtils';
import { ContractWalletUtils } from '../utils/ContractWalletUtils';

const timeout = 60 * 60 * 1000;

// RPC
const blockchainRpcUrl = "https://mumbai-rpc.web3idea.xyz";
const ethersProvider = new ethers.providers.JsonRpcProvider(blockchainRpcUrl);
const ethersWallet = new ethers.Wallet(ethers.Wallet.createRandom().privateKey, ethersProvider);
// ERC4337 变量
const walletFactoryAddres = "0xa5d3E13f26D16A4Af2AEb9f5b6f6a2b7029321Fd";
const entryPointAddress = "0xe60b727562012C8806F832DCD4ab32Acc10ef661";
// SWT
const tokenPaymasterAddress = "0x409646509BE42Aea79Eab370eFC2c0eC2E51753B";
const payGasFeeTokenAddress = "0x409646509BE42Aea79Eab370eFC2c0eC2E51753B";
const bundlerApi = "https://bundler.web3idea.xyz/mumbai";

// MPC 变量
const authorization = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTAzODAyNzgsInN1YiI6MX0.fNT7DI8QQKVNzGxv9a9Yw0wYOOlpXiWKorBjD98Z-kI";
const mpcKeyStr = '{"Id":1,"ShareI":219499044982805701588892377127447501004150432209403709303384334655408914819632,"PublicKey":{"Curve":"secp256k1","X":97292621653416266750380703637875538596866301353776849812982916816163853412988,"Y":32440693875191451391160231867342089322288044048122424317742935922111154446039},"ChainCode":"013d57fb4dea99754bc3773dedf201f9c555684eab127a529d335663c0063425c9","SharePubKeyMap":{"1":{"Curve":"secp256k1","X":29161051009961544429569809800230777877472024870500305033506395207674118416373,"Y":44796153314212729221467409179106608297103339961871905099986927630538307838333},"2":{"Curve":"secp256k1","X":40713022408703343240041761412242766867715143730321538117446016757996923246685,"Y":54311185172390094674585055235636263490742909410647712991051877387418786801570},"3":{"Curve":"secp256k1","X":36535362237429459090412737650018500331292975515911824642793483191706305761009,"Y":97503616435531946333830622361346685900869373933095170990256609518446036018220}}}';

// mpc账户
const mpcBackendApiUrl = "https://auth-dev.web3idea.xyz/api/v1";
const mpcWasmUrl = "https://decentralized-storage-01.web3idea.xyz/package/mpc/wasm/v0_2/mpc.wasm";
const createWalletApiUrl = mpcBackendApiUrl + "/ca/create";

const mpcAccount = new MPCManageAccount(blockchainRpcUrl, mpcBackendApiUrl, mpcWasmUrl, authorization, createWalletApiUrl);

let walletAddress: string;

beforeAll(async () => {
    console.log("beforeAll start");

    // init mpc account
    await mpcAccount.initAccount(mpcKeyStr);
    console.log("ownerAddress:", mpcAccount.getOwnerAddress);

    walletAddress = await ContractWalletUtils.calcContractWalletAddress(blockchainRpcUrl, await mpcAccount.getOwnerAddress(), walletFactoryAddres, 0);
    console.log("walletAddress:", walletAddress);

    // deploy contract wallet if not exist
    await mpcAccount.deployContractWalletIfNotExist(walletAddress);
    
    console.log("beforeAll end");
}, timeout);

// test('change network and then build transfer native token tx without token pay master', async () => {
//     const gasPrice = await ethersWallet.getGasPrice();
//     console.log("gasPrice:", gasPrice)
//     const op = await mpcAccount.buildTxTransferNativeToken(
//         walletAddress,
//         entryPointAddress,
//         gasPrice,
//         "0x78857c6C19fD2e5E4bAbDcEd5b10861f8858d374",
//         ethers.utils.parseEther("0.00001"),
//     );
//     console.log("transfer native token tx without token pay master. op:", JSONBigInt.stringify(op));
// }, timeout);

// test('calculate owner address', async () => {
//     const ownerAddress = await mpcAccount.getOwnerAddress()
//     console.log("ownerAddress:", ownerAddress);
//     expect(ownerAddress).toBe("0xd5eCdffB469576D7682fE6b02C9549d6C7756d98");
// }, timeout);

test('build transfer native token tx without token pay master', async () => {
    const gasPrice = await ethersWallet.getGasPrice();
    console.log("gasPrice:", gasPrice)
    const op = await mpcAccount.buildTxTransferNativeToken(
        walletAddress,
        entryPointAddress,
        gasPrice,
        "0x78857c6C19fD2e5E4bAbDcEd5b10861f8858d374",
        ethers.utils.parseEther("0.00001"),
    );
    console.log("transfer native token tx without token pay master. op:", JSONBigInt.stringify(op));
}, timeout);

// test('build transfer native token tx with token pay master', async () => {
//     const gasPrice = await ethersWallet.getGasPrice();
//     console.log("gasPrice:", gasPrice)
//     const op = await mpcAccount.buildTxTransferNativeToken(
//         walletAddress,
//         entryPointAddress,
//         gasPrice,
//         "0x78857c6C19fD2e5E4bAbDcEd5b10861f8858d374",
//         ethers.utils.parseEther("0.00001"),
//         tokenPaymasterAddress,
//         payGasFeeTokenAddress
//     );
//     console.log("transfer native token tx with token pay master. op:", JSONBigInt.stringify(op));
// }, timeout);

// test('build transfer erc20 token tx with token pay master', async () => {
//     const gasPrice = await ethersWallet.getGasPrice();
//     console.log("gasPrice:", gasPrice)
//     const op = await mpcAccount.buildTxTransferERC20Token(
//         walletAddress,
//         entryPointAddress,
//         gasPrice,
//         "0x78857c6C19fD2e5E4bAbDcEd5b10861f8858d374",
//         ethers.utils.parseEther("0.00001"),
//         // 这里是交易的token地址 这里测试直接用的tokenPaymasterAddress
//         tokenPaymasterAddress,
//         tokenPaymasterAddress,
//         payGasFeeTokenAddress
//     );
//     console.log("transfer erc20 token tx with token pay master. op:", JSONBigInt.stringify(op));
// }, timeout);

// test('build transfer erc20 token tx without token pay master', async () => {
//     const gasPrice = await ethersWallet.getGasPrice();
//     console.log("gasPrice:", gasPrice)
//     const op = await mpcAccount.buildTxTransferERC20Token(
//         walletAddress,
//         entryPointAddress,
//         gasPrice,
//         "0x78857c6C19fD2e5E4bAbDcEd5b10861f8858d374",
//         ethers.utils.parseEther("0.00001"),
//         // 这里是交易的token地址 这里测试直接用的tokenPaymasterAddress
//         tokenPaymasterAddress,
//     );
//     console.log("transfer erc20 token tx without token pay master. op:", JSONBigInt.stringify(op));
// }, timeout);