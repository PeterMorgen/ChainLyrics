"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/providers/WalletProvider";
import { ethers } from "ethers";
import { getLyricsNFTContract, getLyricsRegistryContract } from "@/lib/contracts";

export default function MintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { provider, chainId, address, connect } = useWallet();
  const [loading, setLoading] = useState(false);
  const numericId = useMemo(() => Number(id || 0), [id]);

  const onMint = async () => {
    try {
      if (!provider) await connect();
      if (!provider || !chainId || !address) throw new Error("钱包未连接");
      const web3 = new ethers.BrowserProvider(provider);
      const signer = await web3.getSigner();
      const nft = getLyricsNFTContract(signer, chainId);
      const registry = getLyricsRegistryContract(signer, chainId);
      const s = await registry.getSong(numericId);
      const title = String(s.title);
      const contributors: string[] = (s.collaborators as string[]) || [];
      setLoading(true);
      const tx = await nft.mintNFT(address, numericId, title, String(s.lyricsCID), contributors);
      await tx.wait();
      alert(`NFT 已铸造，tx=${tx.hash}`);
    } catch (e: any) {
      alert(`铸造失败: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto glass-card p-8 space-y-6">
          <h1 className="text-2xl font-bold">Mint NFT</h1>
          <button onClick={onMint} disabled={loading} className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-purple-500/50 transition-all">
            {loading ? "Submitting..." : "Confirm"}
          </button>
          <Link href={`/song/${id}`} className="glass-button inline-block">← Back to song</Link>
        </div>
      </div>
    </div>
  );
}


