import { BigNumber, ContractInterface } from "ethers";

export type ExecuteParams = NavtieTransferParams | ContractCallParams | ContractCall;

export interface NavtieTransferParams {
  ethValue: BigNumber;
  toAddress: string;
}

export interface ContractCallParams {
  ethValue: BigNumber;
  callContractAbi: ContractInterface;
  callContractAddress: string;
  callFunc: string;
  callParams: ReadonlyArray<any>;
}

export interface ContractCall {
  ethValue: BigNumber;
  callContractAddress: string;
  calldataHex: string;
}

export function isNavtieTransferParams(params: ExecuteParams): params is NavtieTransferParams {
  return (params as NavtieTransferParams).toAddress !== undefined;
}

export function isContractCallParams(params: ExecuteParams): params is ContractCallParams {
  return (params as ContractCallParams).callContractAbi !== undefined;
}

export function isContractCall(params: ExecuteParams): params is ContractCall {
  return (params as ContractCall).calldataHex !== undefined;
}