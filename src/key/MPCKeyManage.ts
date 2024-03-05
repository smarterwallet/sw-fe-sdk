import { CryptologyUtils } from "../utils/CryptologyUtils";
import { HttpUtils } from "../utils/HttpUtils";
import * as mpcWasmUtils from "../mpc/MpcWasmUtils.js";
import { JSONBigInt } from "../mpc/CommonUtils";

/**
 * MPC key manage
 */
export class MPCKeyManage {

    private authSeviceBackendApi: string;
    private decentralizeStorageApi: string;
    private localKeyName: string;
    private thirdPartyHashKeyName: string;

    constructor(authSeviceBackendApi: string, decentralizeStorageApi:string) {
        this.localKeyName = "mpc_key_local";
        this.thirdPartyHashKeyName = "mpc_key_thrid_party_hash";

        this.authSeviceBackendApi = authSeviceBackendApi;
        this.decentralizeStorageApi = decentralizeStorageApi;
    }

    async saveKey2WalletServer(authorization:string, key: string, hash: string) {
        let api = this.authSeviceBackendApi + "/mpc/key/save";
        return HttpUtils.postWithAuth(
            api,
            {
                key,
                decentralized_storage_key_hash: hash,
            },
            authorization
        );
    }

    saveKey2LocalStorage(key: string, password: string): boolean {
        key = CryptologyUtils.encrypt(key, password);
        localStorage.setItem(this.localKeyName, key);
        return true;
    }

    saveKeyThirdHash2LocalStorage(keyName:string, key: string, password: string): boolean {
        key = CryptologyUtils.encrypt(key, password);
        localStorage.setItem(this.thirdPartyHashKeyName, key);
        return true;
    }

    /**
     * save key to ipfs
     * @param key private key
     * @param password from user input
     * @returns result
     */
    async saveKey2DecentralizeStorage(authorization:string, key: string, password: string) {
        key = CryptologyUtils.encrypt(key, password);
        let api = this.decentralizeStorageApi + "/ipfs/upload/string";
        return HttpUtils.postWithAuth(
            api,
            {
                data: key,
            },
            authorization
        );
    }

    async saveKey2Backend(authorization:string, key: string, hash: string) {
        let api = this.authSeviceBackendApi + "/mpc/key/save";
        return HttpUtils.postWithAuth(
            api,
            {
                key: key,
                hash: hash,
            },
            authorization
        );
    }

    existLocalStorageKey(): boolean {
        return (
            localStorage.getItem(this.localKeyName) !== null &&
            localStorage.getItem(this.thirdPartyHashKeyName) !== null
        );
    }

    getKeyFromLocalStorage(password: string): string|null {
        const keyInLocal = localStorage.getItem(this.localKeyName);
        if (keyInLocal == null || keyInLocal === "") {
            return null;
        }
        const data = CryptologyUtils.decrypt(keyInLocal, password);
        if (data == null || data === "") {
            return data;
        }
        return mpcWasmUtils.parseNumbers(JSONBigInt.parse(data));
    }

    deleteKeyFromLocalStorage(): void {
        localStorage.removeItem(this.localKeyName);
        localStorage.removeItem(this.thirdPartyHashKeyName);
    }

}