import { ethers } from "ethers";

export class TxUtils {
  public static async waitForTransactionUntilOnChain(blockchainRpc: string, txHash: string) {
    const ethersProvider = new ethers.providers.JsonRpcProvider(blockchainRpc);
    let receipt = await ethersProvider.getTransactionReceipt(txHash);

    while (!receipt) {
      await sleep(1000);
      await ethersProvider.waitForTransaction(txHash);
      receipt = await ethersProvider.getTransactionReceipt(txHash);
    }
  }
}

const sleep = async (ms: number) => {
  await new Promise(resolve => setTimeout(resolve, ms));
}