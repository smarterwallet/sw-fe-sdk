import { BigNumber, ethers } from "ethers";
import { UserOperation } from "../moduls/UserOperation";
import { AccountInterface } from "./AccountInterface";
import { TxUtils } from "../utils/TxUtils";
import { ContractWalletUtils } from "../utils/ContractWalletUtils";
import {
  ExecuteParams,
  isContractCall,
  isContractCallParams,
  isNavtieTransferParams,
} from "../moduls/ContractCallParams";

const { arrayify } = require("@ethersproject/bytes");

import erc20Abi from "../data/IERC20.js";
import sourceChainSenderAbi from "../data/SourceChainSender";
import smarterAccountV1Abi from "../data/SmarterAccountV1.js";

/**
 * Account Manage Base Class
 */
export class ERC4337BaseManageAccount implements AccountInterface {

  /**
   * block chain rpc url, for check wallet address exist, get wallet address nonce, get chain id
   */
  protected blockchainRpc: string;

  /**
   * a data for init account
   */
  protected initData: any;

  constructor(rpcUrl: string) {
    console.log("ERC4337BaseManageAccount constructor");

    this.blockchainRpc = rpcUrl;
  }

  /**
   * must call initAccount in subclass
   */
  async initAccount(data: any) {
    this.initData = data;
  }

  async deployContractWalletIfNotExist(
    createWalletApiUrl: string,
    ownerAddress: string,
    walletAddress: string
  ) {
    if (this.blockchainRpc == null) {
      console.log("ethersWallet has not been init.");
      return;
    }

    console.log("start to check contract account");
    if (
      await ContractWalletUtils.checkContractAddressExist(
        this.blockchainRpc,
        walletAddress
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
      this.blockchainRpc,
      tx.body["result"]
    );

    console.log("contract account deployed success.");
  }

  private async getWalletAddressNonce(walletAddress: string): Promise<bigint> {
    if (this.blockchainRpc == null) {
      throw new Error("blockchainRpc has not been set.");
    }

    const ethersProvider = new ethers.providers.JsonRpcProvider(this.blockchainRpc);

    let contract = new ethers.Contract(
      walletAddress,
      smarterAccountV1Abi,
      ethersProvider
    );

    const nonce = await contract.nonce();
    return nonce.toBigInt();
  }

  /**
   * Build tx
   */
  async buildTxTransferNativeToken(
    walletAddress: string,
    entryPointAddress: string,
    gasPrice: BigNumber,
    toAddress: string,
    amount: BigNumber,
    tokenPaymasterAddress?: string,
    payGasFeeTokenAddress?: string
  ): Promise<UserOperation> {
    let op = await this.buildTxCallContract(
      walletAddress,
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
    walletAddress: string,
    entryPointAddress: string,
    gasPrice: BigNumber,
    toAddress: string,
    amount: BigNumber,
    erc20ContractAddress: string,
    tokenPaymasterAddress?: string,
    payGasFeeTokenAddress?: string
  ): Promise<UserOperation> {
    let op = await this.buildTxCallContract(
      walletAddress,
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
    walletAddress: string,
    entryPointAddress: string,
    gasPrice: BigNumber,
    toAddress: string,
    amount: BigNumber,
    erc20ContractAddress: string,
    tokenPaymasterAddress?: string,
    payGasFeeTokenAddress?: string
  ): Promise<UserOperation> {
    let op = await this.buildTxCallContract(
      walletAddress,
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

  public async buildTxCrossERC20TokenCCIP(
    walletAddress: string,
    entryPointAddress: string,
    gasPrice: BigNumber,
    sourceChainSenderAddress: string,
    destChainSelector: BigNumber,
    destChainReceiverAddress: string,
    erc20ContractAddress: string,
    receiverAddress: string,
    amount: BigNumber,
    tokenPaymasterAddress?: string,
    payGasFeeTokenAddress?: string
  ): Promise<UserOperation> {
    let op = await this.buildTxCallContract(
      walletAddress,
      entryPointAddress,
      gasPrice,
      [
        {
          ethValue: BigNumber.from(0),
          callContractAbi: erc20Abi,
          callContractAddress: erc20ContractAddress,
          callFunc: "approve",
          callParams: [sourceChainSenderAddress, BigNumber.from(0)],
        },
        {
          ethValue: BigNumber.from(0),
          callContractAbi: erc20Abi,
          callContractAddress: erc20ContractAddress,
          callFunc: "approve",
          callParams: [sourceChainSenderAddress, amount],
        },
        // function fund(uint256 amount) public
        {
          ethValue: BigNumber.from(0),
          callContractAbi: sourceChainSenderAbi,
          callContractAddress: sourceChainSenderAddress,
          callFunc: "fund",
          callParams: [amount],
        },
        // function sendMessage(uint64 destinationChainSelector,address receiver,payFeesIn feeToken,address to,uint256 amount) external returns (bytes32 messageId)
        {
          ethValue: BigNumber.from(0),
          callContractAbi: sourceChainSenderAbi,
          callContractAddress: sourceChainSenderAddress,
          callFunc: "sendMessage",
          // feeToken: 1-Link
          callParams: [destChainSelector, destChainReceiverAddress, 1, receiverAddress, amount],
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
   * @param contractCalls 调用合约的参数
   * @returns
   */
  public async buildTxCallContract(
    walletAddress: string,
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
        );
        const callTxData = callContract.interface.encodeFunctionData(
          callFunc,
          callParams
        );
        execcteBatchCallData.push(callTxData);
      } else if (isContractCall(contractCallParams)) {
        // 组装钱包合约调用数据
        const { ethValue, callContractAddress, calldataHex } = contractCallParams;
        execcteBatchAddress.push(callContractAddress);
        execcteBatchValue.push(ethValue);
        execcteBatchCallData.push(calldataHex);
      }
    }
    const smarterAccountContract = new ethers.Contract(
      ethers.constants.AddressZero,
      smarterAccountV1Abi,
    );
    const callData = smarterAccountContract.interface.encodeFunctionData(
      "executeBatch(address[],uint256[],bytes[])",
      [execcteBatchAddress, execcteBatchValue, execcteBatchCallData]
    );
    // 构建UserOperation
    return await this.buildUserOperation(
      walletAddress,
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
    walletAddress: string,
    callData: string,
    entryPointAddress: string,
    gasPrice: BigNumber,
    tokenPaymasterAddress?: string
  ): Promise<UserOperation> {
    const ethersProvider = new ethers.providers.JsonRpcProvider(this.blockchainRpc);
    const ethersWallet = new ethers.Wallet(
      ethers.Wallet.createRandom().privateKey,
    );

    const nonce = await this.getWalletAddressNonce(walletAddress);
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
        walletAddress,
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
      const paymasterDataSign = await ethersWallet.signMessage(
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
        walletAddress,
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
    const { chainId } = await ethersProvider.getNetwork();
    const packData = ethers.utils.defaultAbiCoder.encode(
      ["bytes32", "address", "uint256"],
      [hash, entryPointAddress, chainId]
    );
    const userOpHash = ethers.utils.keccak256(packData);

    // sender sign UserOperator
    signature = await this.ownerSign(userOpHash);

    const userOperation: UserOperation = {
      sender: walletAddress,
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
