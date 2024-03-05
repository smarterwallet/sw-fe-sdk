import { UserOperation } from "../moduls/UserOperation";
import { HttpUtils } from "../utils/HttpUtils";

/**
 * Bundelr API
 */
export class BundlerRpc {

    public static async sendUserOperation(
        bundlerApi: string,
        op: UserOperation,
        entryPointAddress: string
    ): Promise<{ status: number; body?: any }> {
        const params = {
            jsonrpc: "2.0",
            id: 1,
            method: "eth_sendUserOperation",
            params: [op, entryPointAddress],
        };
        console.log(params);
        // return await HttpUtils.post(Config.BUNDLER_API, null);
        return await HttpUtils.post(bundlerApi, params);
    }

    public static async getUserOperationByHash(
        bundlerApi: string,
        opHash: string
    ): Promise<{ status: number; body?: any }> {
        const params = {
            jsonrpc: "2.0",
            id: 1,
            method: "eth_getUserOperationByHash",
            params: [opHash],
        };
        return await HttpUtils.post(bundlerApi, params);
    }

    public static async getUserOperationReceipt(
        bundlerApi: string,
        opHash: string
    ): Promise<{ status: number; body?: any }> {
        const params = {
            jsonrpc: "2.0",
            id: 1,
            method: "eth_getUserOperationReceipt",
            params: [opHash],
        };
        return await HttpUtils.post(bundlerApi, params);
    }
}