import { ethers } from "ethers";
import { HttpUtils } from "./HttpUtils";
import simpleAccountFactoryAbi from "../data/SimpleAccountFactory.js";

export class ContractWalletUtils {
    public static async checkContractAddressExist(blockchainRpc: string, walletAddress: string): Promise<boolean> {
        const ethersProvider = new ethers.providers.JsonRpcProvider(blockchainRpc);
        let code = await ethersProvider.getCode(walletAddress);
        return code !== "0x";
    }

    public static async createSmartContractWalletAccount(createWalletUrl: string, params: any): Promise<{ status: number; body?: any }> {
        let api = createWalletUrl;
        return await HttpUtils.post(api, params);
    }

    public static async calcContractWalletAddress(blockchainRpc: string, owner: string, walletFactoryAddres: string, walletAddressSalt: number): Promise<string> {
        console.log("Owner EOA Address: ", owner);

        const ethersProvider = new ethers.providers.JsonRpcProvider(blockchainRpc);
        const ethersWallet = new ethers.Wallet(
            ethers.Wallet.createRandom().privateKey,
            ethersProvider
        );

        let contract = new ethers.Contract(
            walletFactoryAddres,
            simpleAccountFactoryAbi,
            ethersProvider
        );
        try {
            return await contract.getAddress(
                owner,
                walletAddressSalt
            );
        } catch (error) {
            console.error(error);
            return "";
        }
    }
}