"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { ethers } from "ethers";
import { useWallet } from "@/providers/WalletProvider";
import { getLyricsNFTContract } from "@/lib/contracts";

export default function MyNFTPage() {
  const { provider, chainId, address, connect } = useWallet();
  const [items, setItems] = useState<Array<{ tokenId: number; title: string; cid: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        if (!provider || !chainId) return;
        const web3 = new ethers.BrowserProvider(provider);
        const signer = await web3.getSigner();
        const nft = getLyricsNFTContract(signer, chainId);
        const owner = address || (await signer.getAddress());
        const arr: Array<{ tokenId: number; title: string; cid: string }> = [];
        // 兼容非 Enumerable：通过 Minted 事件枚举所有 tokenId，再筛 owner
        const events = await nft.queryFilter(nft.filters.Minted());
        for (const ev of events) {
          const tokenId = Number(ev.args?.tokenId);
          try {
            const currentOwner = await nft.ownerOf(tokenId);
            if (currentOwner.toLowerCase() !== owner.toLowerCase()) continue;
            const meta = await nft.getMetadata(tokenId);
            arr.push({ tokenId, title: meta.title as string, cid: meta.finalVersionCID as string });
          } catch {}
        }
        setItems(arr);
      } catch {}
    })();
  }, [provider, chainId, address]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My NFTs</h1>
          {items.length === 0 ? (
            <div className="text-gray-400">No NFTs</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((it) => (
                <div key={it.tokenId} className="glass-card p-6">
                  <div className="text-sm text-gray-400 mb-2">Token #{it.tokenId}</div>
                  <div className="text-xl font-bold mb-2">{it.title}</div>
                  <div className="text-xs break-all text-gray-500">IPFS CID: {it.cid}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


