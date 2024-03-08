import { ethers } from "ethers";
import { AccountInterface } from "./AccountInterface";
import * as mpcWasmUtils from "../mpc/MpcWasmUtils.js";
import { JSONBigInt } from "../mpc/CommonUtils.js";
import { HttpUtils } from "../utils/HttpUtils";
import { ERC4337BaseManageAccount } from "./ERC4337BaseManageAccount";
import { hashMessage, joinSignature } from "ethers/lib/utils";
import { CommonUtils } from "../utils/CommonUtils";

const { arrayify } = require("@ethersproject/bytes");

/**
 * MPC Account Manage
 */
export class MPCManageAccount extends ERC4337BaseManageAccount implements AccountInterface {
  /**
   * wasm instance
   */
  private mpcWasmInstance: any;
  private ownerAddress: string = "";
  private primCacheKey: string = "primResult";
  private mpcBackendApiUrl: string;
  private mpcWasmUrl: string;
  private authorization: string;
  private createWalletApiUrl: string;

  constructor(blockchainRpcUrl: string, mpcBackendApiUrl: string, mpcWasmUrl: string, authorization: string, createWalletApiUrl: string) {
    console.log("MPCManageAccount constructor");
    super(blockchainRpcUrl);

    this.mpcBackendApiUrl = mpcBackendApiUrl;
    this.mpcWasmUrl = mpcWasmUrl;
    this.authorization = authorization;
    this.createWalletApiUrl = createWalletApiUrl;
  }

  public async initAccount(mpcKey: any) {
    console.log("initAccount");

    // 初始化MPC实例
    if (this.mpcWasmInstance === null || this.mpcWasmInstance === undefined) {
      this.mpcWasmInstance = await this.generateMPCWasmInstance();
    }

    if (mpcKey === "" || mpcKey === null) {
      console.log("mpcKey is null");
      return;
    }

    const initP1KeyDataRes = await mpcWasmUtils.wasmInitP1KeyData(mpcKey);
    console.log("initP1KeyData: ", initP1KeyDataRes);
    const initP1KeyDataResJson = JSONBigInt.parse(initP1KeyDataRes);
    if (initP1KeyDataResJson["code"] !== 200) {
      console.log("wasmInitP1KeyData error. Response: " + initP1KeyDataResJson["msg"]);
      return;
    }

    // 初始化账户
    await super.initAccount(mpcKey);

    // 计算owner地址
    await this.updateOwnerAddress();
  }

  private async updateOwnerAddress() {
    this.ownerAddress = await this.getOwnerAddress();
  }

  public async deployContractWalletIfNotExist(walletAddress: string) {
    if (this.ownerAddress === null || this.ownerAddress === undefined || this.ownerAddress === "") {
      await this.updateOwnerAddress();
    }
    await super.deployContractWalletIfNotExist(this.createWalletApiUrl, this.ownerAddress, walletAddress);
  }

  private async generateMPCWasmInstance() {
    console.log("generateMPCWasmInstance start");
    const response = await fetch(this.mpcWasmUrl);
    let buffer = await response.arrayBuffer();
    await mpcWasmUtils.initWasm(buffer);
  }

  public async generateKeys() {
    const keysResult = await mpcWasmUtils.wasmGenerateDeviceData();
    const keysJson = JSONBigInt.parse(keysResult);
    if (keysJson["code"] === 200) {
      return keysJson["data"];
    } else {
      console.log("generateDeviceData error. Response: " + keysResult);
      return null;
    }
  }

  public async getOwnerAddress(): Promise<string> {
    if (this.initData == null || this.initData === "") {
      console.log("have not login wallet server");
      return "";
    }

    console.log("start to get owner address");
    if (this.ownerAddress !== null && this.ownerAddress !== undefined && this.ownerAddress !== "") {
      return this.ownerAddress;
    }

    // get address
    console.log("start to calculate owner address");
    // params: p1 key, p2 id, random prim1, random prim2
    console.log("start to get random prim(each client only needs to get it once)");
    let primResult;
    if (CommonUtils.isBrowserEnvironment()) {
      console.log("read prim on browser");
      // 从 localStorage 获取数据
      let data = localStorage.getItem(this.primCacheKey);
      if (data != null && data !== "") {
        console.log("read prim from local storage");
        primResult = JSON.parse(data);
      } else {
        let primRequestResult = await HttpUtils.get(
          this.mpcBackendApiUrl + "/mpc/calc/get-prim"
        );
        if (primRequestResult.body["code"] !== 200) {
          throw new Error(primRequestResult.body["message"]);
        }
        primResult = primRequestResult.body["result"];
        localStorage.setItem(this.primCacheKey, JSON.stringify(primResult));
      }
    } else {
      console.log("read prim on nodejs");
      let primRequestResult = await HttpUtils.get(
        this.mpcBackendApiUrl + "/mpc/calc/get-prim"
      );
      primResult = primRequestResult.body["result"];
    }
    const prim1 = primResult["p"];
    const prim2 = primResult["q"];
    const addressGenMessage = await mpcWasmUtils.wasmKeyGenRequestMessage(
      2,
      prim1,
      prim2
    );
    // console.log("Generate address Request Message: ", addressGenMessage);
    let addressGenMessageJson = JSONBigInt.parse(addressGenMessage);
    console.log("addressGenMessage:", addressGenMessageJson["data"]);

    console.log("start to bind-user-p2");
    let bindResult = await HttpUtils.postWithAuth(
      this.mpcBackendApiUrl + "/mpc/calc/bind-user-p2",
      {
        p1_message_dto: addressGenMessageJson["data"],
        p1_data_id: 1,
      },
      this.authorization
    );
    if (bindResult.body["code"] !== 200) {
      throw new Error(bindResult.body["message"]);
    }
    console.log("bindResult:", bindResult.body);

    // send http request to get address
    console.log("start to get address");
    let getAddressAndPubKeyRes = await HttpUtils.postWithAuth(
      this.mpcBackendApiUrl + "/mpc/calc/get-address",
      {},
      this.authorization
    );
    if (getAddressAndPubKeyRes.body["code"] !== 200) {
      throw new Error(getAddressAndPubKeyRes.body["message"]);
    }
    const address = getAddressAndPubKeyRes.body["result"]["address"];
    const pubKey = getAddressAndPubKeyRes.body["result"]["pub_key"];
    console.log("Address: " + address);
    console.log("PubKey: " + pubKey);
    mpcWasmUtils.wasmInitPubKey(pubKey);

    this.ownerAddress = address;
    return address;
  }

  public async ownerSign(message: string): Promise<string> {
    let hash = hashMessage(arrayify(message));
    hash = hash.substring(2);
    // send http request to get address
    console.log("start to init-p2-content");
    let initP2ContentRes = await HttpUtils.postWithAuth(
      this.mpcBackendApiUrl + "/mpc/calc/init-p2-content",
      {
        message: hash,
      },
      this.authorization
    );
    console.log("initP2ContentRes: ", initP2ContentRes);
    if (initP2ContentRes.body["code"] !== 200) {
      throw new Error(initP2ContentRes.body["message"]);
    }
    // Step 0
    // params: p1 key, p2 id, random prim1, random prim2
    const initP1ContextRes = await mpcWasmUtils.wasmInitP1Context(hash);
    console.log(`initP1Context: ${initP1ContextRes}`);

    // p1 step1
    const p1Step1Res = await mpcWasmUtils.wasmP1Step1();
    console.log(`p1Step1: ${p1Step1Res}`);

    // p2 step1
    let p2Step1Result = await HttpUtils.postWithAuth(
      this.mpcBackendApiUrl + "/mpc/calc/p2-step1",
      {
        commitment: JSONBigInt.parse(p1Step1Res)["data"],
      },
      this.authorization
    );
    console.log("p2Step1Result: ", p2Step1Result);
    if (p2Step1Result.body["code"] !== 200) {
      throw new Error(p2Step1Result.body["message"]);
    }

    let proofJson = p2Step1Result.body["result"]["proof"];
    console.log("p2Step1Result proofJson: ", proofJson);
    proofJson = mpcWasmUtils.parseNumbers(proofJson);
    console.log(
      "p2Step1Result proofJsonStr: ",
      JSONBigInt.stringify(proofJson)
    );

    let ecpointJson = p2Step1Result.body["result"]["ecpoint"];
    ecpointJson = mpcWasmUtils.parseNumbers(ecpointJson);
    console.log(
      "p2Step1Result ecpointJsonStr: ",
      JSONBigInt.stringify(ecpointJson)
    );

    // p1 step2
    const p1Step2Res = await mpcWasmUtils.wasmP1Step2(
      JSONBigInt.stringify(proofJson),
      JSONBigInt.stringify(ecpointJson)
    );
    console.log(`p1Step2: ${p1Step2Res}`);

    const p1Step2ResJSON = JSONBigInt.parse(p1Step2Res);
    let p1ProofJson = p1Step2ResJSON["data"]["SchnorrProofOutput"];
    p1ProofJson = mpcWasmUtils.parseNumbers(p1ProofJson);
    console.log("p1Step2Res p1ProofJson: ", JSONBigInt.stringify(p1ProofJson));

    let cmtDJson = p1Step2ResJSON["data"]["Witness"];
    cmtDJson = mpcWasmUtils.parseNumbers(cmtDJson);
    console.log("p1Step2Res cmtDJson: ", JSONBigInt.stringify(cmtDJson));

    // p2 step2
    let p2Step2Result = await HttpUtils.postWithAuth(
      this.mpcBackendApiUrl + "/mpc/calc/p2-step2",
      {
        cmt_d: cmtDJson,
        p1_proof: p1ProofJson,
      },
      this.authorization
    );
    console.log("p2Step2Result: ", p2Step2Result);
    if (p2Step2Result.body["code"] !== 200) {
      throw new Error(p2Step2Result.body["message"]);
    }

    // p1 step3
    const p1Step3Res = await mpcWasmUtils.wasmP1Step3(
      p2Step2Result.body["result"],
      hash
    );
    console.log(`p1Step2: ${p1Step3Res}`);

    const signHex = "0x" + JSONBigInt.parse(p1Step3Res)["data"]["SignHex"];
    const signForContract = joinSignature(signHex);
    return signForContract;
  }

  public setBlockchainRpc(blockchainRpcUrl: string) {
    this.blockchainRpc = blockchainRpcUrl;
  }

}
