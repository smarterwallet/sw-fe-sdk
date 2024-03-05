import { ethers } from "ethers";
import { HttpUtils } from "./HttpUtils";

export class ContractWalletUtils {
    public static async checkContractAddressExist(ethersProvider: ethers.providers.JsonRpcProvider, walletAddress: string): Promise<boolean> {
        let code = await ethersProvider.getCode(walletAddress);
        return code !== "0x";
    }

    public static async createSmartContractWalletAccount(createWalletUrl: string, params: any): Promise<{ status: number; body?: any }> {
        let api = createWalletUrl;
        return await HttpUtils.post(api, params);
    }
}