"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ethers } from "ethers";
import { useWallet } from "@/providers/WalletProvider";
import { getLyricsRegistryContract, getRevenueSplitContract } from "@/lib/contracts";

export default function TipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { provider, chainId, address, connect } = useWallet();
  const [amount, setAmount] = useState<string>("0.01");
  const [loading, setLoading] = useState(false);
  const numericId = useMemo(() => Number(id || 0), [id]);

  const onTip = async () => {
    try {
      if (!provider) await connect();
      if (!provider || !chainId) throw new Error("钱包未连接");
      const web3 = new ethers.BrowserProvider(provider);
      const signer = await web3.getSigner();
      const registry = getLyricsRegistryContract(signer, chainId);
      const rev = getRevenueSplitContract(signer, chainId);
      const song = await registry.getSong(numericId);
      const creator: string = song.creator as string;

      // 走收益合约：分发到可提余额
      setLoading(true);
      const value = ethers.parseEther(amount);
      try {
        const tx = await rev.distributeRevenue(numericId, ethers.ZeroAddress, value, { value });
        await tx.wait();
        alert(`已打赏 ${amount} ETH，已计入收益。tx=${tx.hash}`);
        return;
      } catch (e: any) {
        // 如果未配置分成，合约会报 "no shares"；默认将 100% 配置给创作者后重试
        if (String(e?.message || e).includes("no shares")) {
          const shares = [{ account: creator, bps: 10000 }];
          const setTx = await rev.setShares(numericId, shares);
          await setTx.wait();
          const tx2 = await rev.distributeRevenue(numericId, ethers.ZeroAddress, value, { value });
          await tx2.wait();
          alert(`已设置默认分成并完成打赏：${amount} ETH。tx=${tx2.hash}`);
          return;
        }
        throw e;
      }
    } catch (e: any) {
      alert(`打赏失败: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto glass-card p-8 space-y-6">
          <h1 className="text-2xl font-bold">Tip Author</h1>
          <div>
            <label className="text-sm text-gray-400">Amount (ETH)</label>
            <input value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full mt-2 bg-white/5 border border-white/20 rounded-lg px-4 py-3 focus:outline-none" />
          </div>
          <button onClick={onTip} disabled={loading} className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-purple-500/50 transition-all">
            {loading ? "Sending..." : "Confirm"}
          </button>
          <Link href={`/song/${id}`} className="glass-button inline-block">← Back to song</Link>
        </div>
      </div>
    </div>
  );
}


