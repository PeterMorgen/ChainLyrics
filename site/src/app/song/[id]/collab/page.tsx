"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ethers } from "ethers";
import { useWallet } from "@/providers/WalletProvider";
import { getCollaborationManagerContract, getLyricsRegistryContract } from "@/lib/contracts";

export default function CollabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { provider, chainId, connect } = useWallet();
  const [joining, setJoining] = useState(false);
  const numericId = useMemo(() => Number(id || 0), [id]);

  const onJoin = async () => {
    try {
      if (!provider) await connect();
      if (!provider || !chainId) throw new Error("钱包未连接");
      const web3 = new ethers.BrowserProvider(provider);
      const signer = await web3.getSigner();
      const cm = getCollaborationManagerContract(signer, chainId);
      const registry = getLyricsRegistryContract(signer, chainId);
      setJoining(true);
      try {
        const tx = await cm.joinCollab(numericId);
        await tx.wait();
        alert(`已申请协作，tx=${tx.hash}`);
        return;
      } catch (e: any) {
        const msg = String(e?.message || e);
        if (msg.includes("Not opened")) {
          // 若未开启协作，先由当前用户开启，并将创作者加入初始成员
          const s = await registry.getSong(numericId);
          const creator = String(s.creator);
          const openTx = await cm.openCollaboration(numericId, [creator]);
          await openTx.wait();
          const tx2 = await cm.joinCollab(numericId);
          await tx2.wait();
          alert(`已开启协作并加入，tx=${tx2.hash}`);
          return;
        }
        if (msg.includes("Already member")) {
          alert("你已在协作中");
          return;
        }
        throw e;
      }
    } catch (e: any) {
      alert(`申请失败: ${e?.message || e}`);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto glass-card p-8 space-y-6">
          <h1 className="text-2xl font-bold">Request Collaboration</h1>
          <button onClick={onJoin} disabled={joining} className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-purple-500/50 transition-all">
            {joining ? "Submitting..." : "Join collaboration"}
          </button>
          <Link href={`/song/${id}`} className="glass-button inline-block">← Back to song</Link>
        </div>
      </div>
    </div>
  );
}


