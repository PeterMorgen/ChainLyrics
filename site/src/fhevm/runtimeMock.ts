import { ethers } from "ethers";
import type { FhevmInstance } from "./types";

// 轻量封装，转调 @fhevm/mock-utils 风格接口

export async function fhevmMockCreateInstance(params: {
  provider: ethers.Eip1193Provider;
  chainId: number;
}): Promise<FhevmInstance> {
  const { MockFhevmInstance } = await import("@fhevm/mock-utils");
  const provider = new ethers.BrowserProvider(params.provider);
  const signer = await provider.getSigner();
  const inst = await MockFhevmInstance.create({ rpcUrl: "http://127.0.0.1:8545", chainId: params.chainId });
  return inst as unknown as FhevmInstance;
}






