import { BigNumber, ethers } from "ethers";
import { UserOperation } from "../moduls/UserOperation";
import { AccountInterface } from "./AccountInterface";
import { TxUtils } from "../utils/TxUtils";
import { ContractWalletUtils } from "../utils/ContractWalletUtils";
import {
  ExecuteParams,
  isContractCallParams,
  isNavtieTransferParams,
} from "../moduls/ContractCallParams";

const { arrayify } = require("@ethersproject/bytes");

import simpleAccountFactoryAbi from "../data/SimpleAccountFactory.js";
import simpleAccountAbi from "../data/SimpleAccount.js";
import erc20Abi from "../data/IERC20.js";
import smarterAccountV1Abi from "../data/SmarterAccountV1.js";

/**
 * Account Manage Base Class
 */
export class ERC4337BaseManageAccount implements AccountInterface {
  /**
   * smart contract address for saving the asset
   */
  private walletFactoryAddres: string = "";
  private walletAddressSalt: number = 0;
  private walletAddress: string = "";

  /**
   * wallet client
   */
  private ethersWallet: ethers.Wallet;
  private ethersProvider: ethers.providers.JsonRpcProvider;

  /**
   * gasPrice = gasPriceOnChain * feeRate / 100
   */
  private feeRate: number;

  /**
   * a data for init account
   */
  protected initData: any;

  constructor(rpcUrl: string, walletFactoryAddres: string) {
    console.log("ERC4337BaseManageAccount constructor");
    this.feeRate = 150;

    this.walletFactoryAddres = walletFactoryAddres;

    this.ethersProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.ethersWallet = new ethers.Wallet(
      ethers.Wallet.createRandom().privateKey,
      this.ethersProvider
    );
  }

  /**
   * must call initAccount in subclass
   */
  async initAccount(data: any) {
    this.initData = data;

    // calc contract wallet address
    this.walletAddress = await this.calcContractWalletAddress();
  }

  async calcContractWalletAddress(): Promise<string> {
    console.log("Owner EOA Address: ", await this.getOwnerAddress());

    let contract = new ethers.Contract(
      this.walletFactoryAddres,
      simpleAccountFactoryAbi,
      this.ethersProvider
    );
    try {
      return await contract.getAddress(
        this.getOwnerAddress(),
        this.walletAddressSalt
      );
    } catch (error) {
      console.error(error);
      return "";
    }
  }

  async deployContractWalletIfNotExist(
    createWalletApiUrl: string,
    ownerAddress: string
  ) {
    if (this.ethersWallet == null) {
      console.log("ethersWallet has not been init.");
      return;
    }

    console.log("start to check contract account");
    if (
      await ContractWalletUtils.checkContractAddressExist(
        this.ethersProvider,
        this.walletAddress
      )
    ) {
      console.log("contract account has been deployed.");
      return;
    }

    // create smart contract account on chain
    console.log("create contract");
    let params = { address: ownerAddress };
    let tx = await ContractWalletUtils.createSmartContractWalletAccount(
      createWalletApiUrl,
      params
    );
    console.log("create contract tx hash: ", tx);

    await TxUtils.waitForTransactionUntilOnChain(
      this.ethersProvider,
      tx.body["result"]
    );

    let newContractAddress = this.walletAddress;

    if (this.walletAddress !== newContractAddress) {
      throw new Error(
        "Deployed contract address error. The new contract address not equals contract address"
      );
    }
  }

  private async getContractWalletAddressNonce(): Promise<string> {
    let contract = new ethers.Contract(
      this.walletAddress,
      simpleAccountAbi,
      this.ethersProvider
    );
    try {
      return (await contract.nonce()).toBigInt();
    } catch (error) {
      console.error(error);
      return "";
    }
  }

  /**
   * Build tx
   */
  async buildTxTransferNativeToken(
    entryPointAddress: string,
    gasPrice: BigNumber,
    toAddress: string,
    amount: BigNumber,
    tokenPaymasterAddress?: string,
    payGasFeeTokenAddress?: string
  ): Promise<UserOperation> {
    let op = await this.buildTxCallContract(
      entryPointAddress,
      gasPrice,
      [
        {
          ethValue: amount,
          toAddress,
        },
      ],
      tokenPaymasterAddress,
      payGasFeeTokenAddress
    );
    return op;
  }

  async buildTxTransferERC20Token(
    entryPointAddress: string,
    gasPrice: BigNumber,
    toAddress: string,
    amount: BigNumber,
    erc20ContractAddress: string,
    tokenPaymasterAddress?: string,
    payGasFeeTokenAddress?: string
  ): Promise<UserOperation> {
    let op = await this.buildTxCallContract(
      entryPointAddress,
      gasPrice,
      [
        {
          ethValue: BigNumber.from(0),
          callContractAbi: erc20Abi,
          callContractAddress: erc20ContractAddress,
          callFunc: "transfer",
          callParams: [toAddress, amount],
        },
      ],
      tokenPaymasterAddress,
      payGasFeeTokenAddress
    );
    return op;
  }

  public async buildTxApproveERC20Token(
    entryPointAddress: string,
    gasPrice: BigNumber,
    toAddress: string,
    amount: BigNumber,
    erc20ContractAddress: string,
    tokenPaymasterAddress?: string,
    payGasFeeTokenAddress?: string
  ): Promise<UserOperation> {
    let op = await this.buildTxCallContract(
      entryPointAddress,
      gasPrice,
      [
        {
          ethValue: BigNumber.from(0),
          callContractAbi: erc20Abi,
          callContractAddress: erc20ContractAddress,
          callFunc: "approve",
          callParams: [toAddress, amount],
        },
      ],
      tokenPaymasterAddress,
      payGasFeeTokenAddress
    );
    return op;
  }

  /**
   * build call contract tx
   * @param entryPointAddress
   * @param tokenPaymasterAddress
   * @param gasPrice
   * @param ethValue 交易发送ETH数量，单纯调合约时为0
   * @param callContractAbi 调用的合约ABI文件
   * @param callContractAddress 调用的合约地址
   * @param callFunc 调用的方法
   * @param callParams 调用参数
   * @returns
   */
  public async buildTxCallContract(
    entryPointAddress: string,
    gasPrice: BigNumber,
    contractCalls: ExecuteParams[],
    tokenPaymasterAddress?: string,
    payGasFeeTokenAddress?: string
  ): Promise<UserOperation> {
    const execcteBatchCallData = [];
    const execcteBatchAddress = [];
    const execcteBatchValue: BigNumber[] = [];

    // ERC20 token 代付合约，需要先授权
    if (
      tokenPaymasterAddress !== undefined &&
      payGasFeeTokenAddress === undefined
    ) {
      const erc20Contract = new ethers.Contract(
        ethers.constants.AddressZero,
        erc20Abi,
        this.ethersProvider
      );
      const approveZeroCallData = erc20Contract.interface.encodeFunctionData(
        "approve",
        [tokenPaymasterAddress, 0]
      );
      const approveMaxCallData = erc20Contract.interface.encodeFunctionData(
        "approve",
        [tokenPaymasterAddress, ethers.constants.MaxUint256]
      );
      // 组装调用的合约数据
      execcteBatchAddress.push(payGasFeeTokenAddress, payGasFeeTokenAddress);
      execcteBatchValue.push(BigNumber.from(0), BigNumber.from(0));
      execcteBatchCallData.push(approveZeroCallData, approveMaxCallData);
    }

    for (const contractCallParams of contractCalls) {
      if (isNavtieTransferParams(contractCallParams)) {
        // 组装钱包native token交易数据
        const { ethValue, toAddress } = contractCallParams;
        execcteBatchAddress.push(toAddress);
        execcteBatchValue.push(ethValue);
        execcteBatchCallData.push("0x");
        continue;
      } else if (isContractCallParams(contractCallParams)) {
        // 组装钱包合约调用数据
        const {
          ethValue,
          callContractAbi,
          callContractAddress,
          callFunc,
          callParams,
        } = contractCallParams;
        execcteBatchAddress.push(callContractAddress);
        execcteBatchValue.push(ethValue);
        const callContract = new ethers.Contract(
          ethers.constants.AddressZero,
          callContractAbi,
          this.ethersProvider
        );
        const callTxData = callContract.interface.encodeFunctionData(
          callFunc,
          callParams
        );
        execcteBatchCallData.push(callTxData);
      }
    }
    const smarterAccountContract = new ethers.Contract(
      ethers.constants.AddressZero,
      smarterAccountV1Abi,
      this.ethersProvider
    );
    const callData = smarterAccountContract.interface.encodeFunctionData(
      "executeBatch(address[],uint256[],bytes[])",
      [execcteBatchAddress, execcteBatchValue, execcteBatchCallData]
    );
    // 构建UserOperation
    return await this.buildUserOperation(
      callData,
      entryPointAddress,
      gasPrice,
      tokenPaymasterAddress
    );
  }

  /**
   * 构建UserOperation
   */
  private async buildUserOperation(
    callData: string,
    entryPointAddress: string,
    gasPrice: BigNumber,
    tokenPaymasterAddress?: string
  ): Promise<UserOperation> {
    const senderAddress = this.walletAddress;
    const nonce = await this.getContractWalletAddressNonce();
    const initCode = "0x";

    // TODO The way in which parameters are determined needs to be discussed
    const callGasLimit = 500000;
    const verificationGasLimit = 500000;
    const preVerificationGas = 500000;
    const maxFeePerGas = gasPrice;
    const maxPriorityFeePerGas = gasPrice;
    let paymasterAndData;
    let signature = "0x";

    // paymaster sign
    let paymasterSignPack = ethers.utils.defaultAbiCoder.encode(
      [
        "address",
        "uint256",
        "bytes",
        "bytes",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
      ],
      [
        senderAddress,
        nonce,
        initCode,
        callData,
        callGasLimit,
        verificationGasLimit,
        preVerificationGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
      ]
    );

    // paymaster
    if (tokenPaymasterAddress !== undefined) {
      const paymasterSignPackHash = ethers.utils.keccak256(paymasterSignPack);
      // The tested TokenPaymaster did not contain verification logic, so the signature was not verified
      const paymasterDataSign = await this.ethersWallet.signMessage(
        arrayify(paymasterSignPackHash)
      );
      paymasterAndData = ethers.utils.defaultAbiCoder.encode(
        ["bytes20", "bytes"],
        [tokenPaymasterAddress, paymasterDataSign]
      );
    } else {
      paymasterAndData = "0x";
    }

    // calculation UserOperation hash for sign
    let userOpPack = ethers.utils.defaultAbiCoder.encode(
      [
        "address",
        "uint256",
        "bytes",
        "bytes",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "bytes",
        "bytes",
      ],
      [
        senderAddress,
        nonce,
        initCode,
        callData,
        callGasLimit,
        verificationGasLimit,
        preVerificationGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        paymasterAndData,
        signature,
      ]
    );
    // remove signature
    userOpPack = userOpPack.substring(0, userOpPack.length - 64);
    const hash = ethers.utils.keccak256(userOpPack);
    const { chainId } = await this.ethersProvider.getNetwork();
    const packData = ethers.utils.defaultAbiCoder.encode(
      ["bytes32", "address", "uint256"],
      [hash, entryPointAddress, chainId]
    );
    const userOpHash = ethers.utils.keccak256(packData);

    // sender sign UserOperator
    signature = await this.ownerSign(userOpHash);

    const userOperation: UserOperation = {
      sender: senderAddress,
      nonce: nonce.toString(),
      initCode: initCode,
      callData: callData,
      callGasLimit: callGasLimit.toString(),
      verificationGasLimit: verificationGasLimit.toString(),
      preVerificationGas: preVerificationGas.toString(),
      maxFeePerGas: maxFeePerGas.toString(),
      maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
      paymasterAndData: paymasterAndData,
      signature: signature,
    };
    console.log(userOperation);
    return userOperation;
  }

  /**
   * need to implement
   */
  async getOwnerAddress(): Promise<string> {
    throw new Error("need to implement");
  }

  async ownerSign(hash: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
