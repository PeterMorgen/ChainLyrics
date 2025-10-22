import { ethers } from "ethers";
import { LyricsRegistryABI } from "@/abi/LyricsRegistryABI";
import { LyricsRegistryAddresses } from "@/abi/LyricsRegistryAddresses";
import { RevenueSplitABI } from "@/abi/RevenueSplitABI";
import { RevenueSplitAddresses } from "@/abi/RevenueSplitAddresses";
import { CollaborationManagerABI } from "@/abi/CollaborationManagerABI";
import { CollaborationManagerAddresses } from "@/abi/CollaborationManagerAddresses";
import { LyricsNFTABI } from "@/abi/LyricsNFTABI";
import { LyricsNFTAddresses } from "@/abi/LyricsNFTAddresses";
import { LikeRegistryABI } from "@/abi/LikeRegistryABI";
import { LikeRegistryAddresses } from "@/abi/LikeRegistryAddresses";

export function getLyricsRegistryAddress(chainId?: number): `0x${string}` | undefined {
  const entry = chainId ? (LyricsRegistryAddresses as any)[String(chainId)] : undefined;
  const addr = entry?.address as string | undefined;
  return addr as `0x${string}` | undefined;
}

export function getLyricsRegistryContract(
  providerOrSigner: ethers.ContractRunner,
  chainId?: number
) {
  const address = getLyricsRegistryAddress(chainId);
  if (!address) throw new Error("LyricsRegistry not deployed on this network");
  return new ethers.Contract(address, LyricsRegistryABI.abi, providerOrSigner);
}

export function getRevenueSplitAddress(chainId?: number): `0x${string}` | undefined {
  const entry = chainId ? (RevenueSplitAddresses as any)[String(chainId)] : undefined;
  const addr = entry?.address as string | undefined;
  return addr as `0x${string}` | undefined;
}

export function getRevenueSplitContract(
  providerOrSigner: ethers.ContractRunner,
  chainId?: number
) {
  const address = getRevenueSplitAddress(chainId);
  if (!address) throw new Error("RevenueSplit not deployed on this network");
  return new ethers.Contract(address, RevenueSplitABI.abi, providerOrSigner);
}

export function getCollaborationManagerAddress(chainId?: number): `0x${string}` | undefined {
  const entry = chainId ? (CollaborationManagerAddresses as any)[String(chainId)] : undefined;
  return entry?.address as `0x${string}` | undefined;
}

export function getCollaborationManagerContract(
  providerOrSigner: ethers.ContractRunner,
  chainId?: number
) {
  const address = getCollaborationManagerAddress(chainId);
  if (!address) throw new Error("CollaborationManager not deployed on this network");
  return new ethers.Contract(address, CollaborationManagerABI.abi, providerOrSigner);
}

export function getLyricsNFTAddress(chainId?: number): `0x${string}` | undefined {
  const entry = chainId ? (LyricsNFTAddresses as any)[String(chainId)] : undefined;
  return entry?.address as `0x${string}` | undefined;
}

export function getLyricsNFTContract(
  providerOrSigner: ethers.ContractRunner,
  chainId?: number
) {
  const address = getLyricsNFTAddress(chainId);
  if (!address) throw new Error("LyricsNFT not deployed on this network");
  return new ethers.Contract(address, LyricsNFTABI.abi, providerOrSigner);
}

export function getLikeRegistryAddress(chainId?: number): `0x${string}` | undefined {
  const entry = chainId ? (LikeRegistryAddresses as any)[String(chainId)] : undefined;
  return entry?.address as `0x${string}` | undefined;
}

export function getLikeRegistryContract(
  providerOrSigner: ethers.ContractRunner,
  chainId?: number
) {
  const address = getLikeRegistryAddress(chainId);
  if (!address) throw new Error("LikeRegistry not deployed on this network");
  return new ethers.Contract(address, LikeRegistryABI.abi, providerOrSigner);
}


