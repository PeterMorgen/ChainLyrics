import { ethers } from "ethers";
import type { FhevmInstance } from "./types";

// 动态加载 relayer-sdk（UMD），并在本地 Hardhat 时自动使用 mock 实例

async function detectHardhat(provider: ethers.Eip1193Provider): Promise<boolean> {
  try {
    const web3 = new ethers.BrowserProvider(provider);
    const res = await web3.send("web3_clientVersion", []);
    return typeof res === "string" && res.toLowerCase().includes("hardhat");
  } catch {
    return false;
  }
}

export async function createFhevmInstance(params: {
  provider: ethers.Eip1193Provider;
  chainId: number;
}): Promise<FhevmInstance> {
  const isLocal = await detectHardhat(params.provider);
  if (isLocal) {
    // 本地：使用 mock 实例
    const { fhevmMockCreateInstance } = await import("./runtimeMock");
    return fhevmMockCreateInstance({ provider: params.provider, chainId: params.chainId });
  }

  // 测试网：UMD 方式加载 relayer-sdk，并创建实例
  if (!("relayerSDK" in window)) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs";
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load relayer-sdk UMD"));
      document.head.appendChild(script);
    });
  }

  const sdk = (window as any).relayerSDK as any;
  await sdk.initSDK();
  const config = { ...sdk.SepoliaConfig, network: params.provider };
  const instance: FhevmInstance = await sdk.createInstance(config);
  return instance;
}






