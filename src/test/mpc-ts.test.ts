import { MPCManageAccount } from '../account/MPCManageAccount';
import { JSONBigInt } from '../mpc/CommonUtils';

const timeout = 60 * 60 * 1000;

// RPC
const mpcWasmUrl = "https://decentralized-storage-01.web3idea.xyz/package/mpc/wasm/v0_2/mpc.wasm";

const mpcAccount = new MPCManageAccount("", "", mpcWasmUrl, "", "");

beforeAll(async () => {
    console.log("beforeAll start");
    await mpcAccount.initAccount("");
    console.log("beforeAll end");
}, timeout);

test('generate mpc key', async () => {
    const mpckeys = await mpcAccount.generateKeys()
    console.log("mpckeys:", JSONBigInt.stringify(mpckeys));
}, timeout);