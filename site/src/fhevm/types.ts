import type { ethers } from "ethers";

export type Eip1193Provider = ethers.Eip1193Provider | string;

export type FhevmInstance = {
  // minimal subset used by this demo
  createEncryptedInput: (contract: string, user: string) => {
    add32: (v: number | bigint) => void;
    addBool: (v: boolean) => void;
    encrypt: () => Promise<{ handles: string[]; inputProof: string }>;
  };
  userDecrypt: (
    items: { handle: string; contractAddress: string }[],
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: number,
    durationDays: number
  ) => Promise<Record<string, bigint>>;
};






