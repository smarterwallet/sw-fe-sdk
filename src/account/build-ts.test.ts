import { JSONBigInt } from '../mpc/CommonUtils';
import { sleep } from '../utils/TxUtils';
import { MPCManageAccount } from './MPCManageAccount';

beforeAll(() => {
    console.log("beforeAll");
});

test('calculate owner address', async () => {
    const rpcUrl = "https://mumbai-rpc.web3idea.xyz";
    const mpcBackendApiUrl = "https://auth-dev.web3idea.xyz/api/v1";
    const mpcWasmUrl = "https://decentralized-storage-01.web3idea.xyz/package/mpc/wasm/v0_2/mpc.wasm";
    const walletFactoryAddres = "0x57811fb5ea260740244fc81f421a5Ca156c78060";
    const createWalletApiUrl = mpcBackendApiUrl + "/ca/create";

    const authorization = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDk3MzAwNjYsInN1YiI6MX0.J4AtREs-Q0aOGSbUHqugv28WcMRoBlzmzSDgs5BED6Q";
    const mpcKeyStr = '{"Id":1,"ShareI":219499044982805701588892377127447501004150432209403709303384334655408914819632,"PublicKey":{"Curve":"secp256k1","X":97292621653416266750380703637875538596866301353776849812982916816163853412988,"Y":32440693875191451391160231867342089322288044048122424317742935922111154446039},"ChainCode":"013d57fb4dea99754bc3773dedf201f9c555684eab127a529d335663c0063425c9","SharePubKeyMap":{"1":{"Curve":"secp256k1","X":29161051009961544429569809800230777877472024870500305033506395207674118416373,"Y":44796153314212729221467409179106608297103339961871905099986927630538307838333},"2":{"Curve":"secp256k1","X":40713022408703343240041761412242766867715143730321538117446016757996923246685,"Y":54311185172390094674585055235636263490742909410647712991051877387418786801570},"3":{"Curve":"secp256k1","X":36535362237429459090412737650018500331292975515911824642793483191706305761009,"Y":97503616435531946333830622361346685900869373933095170990256609518446036018220}}}';

    const mpcAccount = new MPCManageAccount(rpcUrl, mpcBackendApiUrl, mpcWasmUrl, walletFactoryAddres, authorization, createWalletApiUrl);

    await mpcAccount.initAccount(mpcKeyStr);
    const ownerAddress = await mpcAccount.getOwnerAddress()
    console.log("ownerAddress:", ownerAddress);

    const bundlerApi = "https://bundler.web3idea.xyz/mumbai";
}, 60 * 60 * 1000);
