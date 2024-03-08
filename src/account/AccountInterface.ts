import { BigNumber } from "@ethersproject/bignumber";
import { UserOperation } from "../moduls/UserOperation";
import { ExecuteParams } from "../moduls/ContractCallParams";

/**
 * Account Manage Interface
 */
export interface AccountInterface {
  /**
   * init account
   * @param data init account data, e.g. private key
   * @param rpc rpc url
   */
  initAccount(data: any, rpc: string): void;

  /**
   * get owner address of contract wallet
   */
  getOwnerAddress(): Promise<string>;

  /**
   * build tx interface
   */
  ownerSign(hash: string): Promise<string>;

  /**
   * build native token transfer tx
   *
   * @param entryPointAddress entry point address
   * @param gasPrice gas price
   * @param toAddress transfer to address
   * @param amount transfer amount
   * @param tokenPaymasterAddress token paymaster address
   * @param payGasFeeTokenAddress pay gas fee token address
   */
  buildTxTransferNativeToken(
    walletAddress: string,
    entryPointAddress: string,
    gasPrice: BigNumber,
    toAddress: string,
    amount: BigNumber,
    tokenPaymasterAddress?: string,
    payGasFeeTokenAddress?: string
  ): Promise<UserOperation>;

  /**
   * build erc20 token transfer tx
   *
   * @param entryPointAddress entry point address
   * @param gasPrice gas price
   * @param toAddress transfer to address
   * @param amount transfer amount
   * @param erc20ContractAddress erc20 token contract address
   * @param tokenPaymasterAddress token paymaster address
   * @param payGasFeeTokenAddress pay gas fee token address
   */
  buildTxTransferERC20Token(
    walletAddress: string,
    entryPointAddress: string,
    gasPrice: BigNumber,
    toAddress: string,
    amount: BigNumber,
    erc20ContractAddress: string,
    tokenPaymasterAddress?: string,
    payGasFeeTokenAddress?: string
  ): Promise<UserOperation>;

  /**
   * build erc20 token approve tx
   *
   * @param entryPointAddress entry point address
   * @param gasPrice gas price
   * @param toAddress approve to address
   * @param amount transfer amount
   * @param erc20ContractAddress erc20 token contract address
   * @param tokenPaymasterAddress token paymaster address
   * @param payGasFeeTokenAddress pay gas fee token address
   */
  buildTxApproveERC20Token(
    walletAddress: string,
    entryPointAddress: string,
    gasPrice: BigNumber,
    toAddress: string,
    amount: BigNumber,
    erc20ContractAddress: string,
    tokenPaymasterAddress?: string,
    payGasFeeTokenAddress?: string
  ): Promise<UserOperation>;

  /**
   * build tx call contract
   *
   * @param entryPointAddress entry point address
   * @param gasPrice gas price
   * @param contractCalls call contract params
   * @param tokenPaymasterAddress token paymaster address
   * @param payGasFeeTokenAddress pay gas fee token address
   */
  buildTxCallContract(
    walletAddress: string,
    entryPointAddress: string,
    gasPrice: BigNumber,
    contractCalls: ExecuteParams[],
    tokenPaymasterAddress?: string,
    payGasFeeTokenAddress?: string
  ): Promise<UserOperation>;

  /**
   * deploy smart contract wallet
   */
  deployContractWalletIfNotExist(
    createWalletApiUrl: string,
    ownerAddress: string,
    walletAddress: string
  ): void;
}
