"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import WaveAnimation from "@/components/WaveAnimation";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useWallet } from "@/providers/WalletProvider";
import { ethers } from "ethers";
import { getLyricsRegistryContract, getRevenueSplitContract, getCollaborationManagerContract, getLikeRegistryContract } from "@/lib/contracts";

type LoadedSong = {
  id: number;
  title: string;
  creator: string;
  collaborators: string[];
  lyricsCID: string;
  melodyCID: string;
  createdAt: number;
};

export default function SongDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { provider, chainId } = useWallet();
  const [song, setSong] = useState<LoadedSong | undefined>();
  const [lyrics, setLyrics] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [revenueTotal, setRevenueTotal] = useState<string>("0.0");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [liked, setLiked] = useState<boolean>(false);
  const [starred, setStarred] = useState<boolean>(false);

  const numericId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : 0;
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        if (!provider || !chainId || !numericId) return;
        const web3 = new ethers.BrowserProvider(provider);
        const signer = await web3.getSigner();
        const registry = getLyricsRegistryContract(signer, chainId);
        const s = await registry.getSong(numericId);
        const loaded: LoadedSong = {
          id: Number(s.id),
          title: String(s.title),
          creator: String(s.creator),
          collaborators: (s.collaborators as string[]) || [],
          lyricsCID: String(s.lyricsCID),
          melodyCID: String(s.melodyCID),
          createdAt: Number(s.createdAt),
        };
        setSong(loaded);

        // 协作者 = Registry.collaborators ∪ CM.Joined(songId, *)
        try {
          const cm = getCollaborationManagerContract(signer, chainId);
          const evts = await cm.queryFilter(cm.filters.Joined(numericId), 0, "latest");
          const joined = evts.map((e: any) => String(e.args?.member || e.args?.[1]));
          const set = new Set<string>([...loaded.collaborators.map((a) => a.toLowerCase()), ...joined.map((a) => a.toLowerCase())]);
          setCollaborators(Array.from(set));
        } catch {}

        if (loaded.lyricsCID) {
          try {
            const res = await fetch(`https://ipfs.io/ipfs/${loaded.lyricsCID}`);
            if (res.ok) setLyrics(await res.text());
          } catch {}
        }

        if (loaded.melodyCID) {
          setAudioUrl(`https://ipfs.io/ipfs/${loaded.melodyCID}`);
        }

        // 统计分润总额（仅原生 ETH）
        try {
          const rev = getRevenueSplitContract(signer, chainId);
          const filter = rev.filters.Distributed(numericId);
          const logs = await rev.queryFilter(filter, 0, "latest");
          const sum = logs
            .filter((l: any) => (l.args?.token as string).toLowerCase() === ethers.ZeroAddress.toLowerCase())
            .reduce((acc: bigint, l: any) => acc + (l.args?.amount as bigint), 0n);
          setRevenueTotal(ethers.formatEther(sum));
        } catch {}
      } catch {}
    })();
  }, [provider, chainId, numericId]);

  // 本地喜爱/收藏（localStorage 持久化）
  useEffect(() => {
    const likeKey = `chainlyrics:liked:${numericId}`;
    const starKey = `chainlyrics:starred:${numericId}`;
    try {
      setLiked(localStorage.getItem(likeKey) === "1");
      setStarred(localStorage.getItem(starKey) === "1");
    } catch {}
  }, [numericId]);

  const toggleLike = async () => {
    const likeKey = `chainlyrics:liked:${numericId}`;
    const next = !liked;
    setLiked(next);
    try { localStorage.setItem(likeKey, next ? "1" : "0"); } catch {}
    try {
      if (!provider || !chainId) return;
      const web3 = new ethers.BrowserProvider(provider);
      const signer = await web3.getSigner();
      const likes = getLikeRegistryContract(signer, chainId);
      if (next) {
        const tx = await likes.like(numericId);
        await tx.wait();
      } else {
        const tx = await likes.unlike(numericId);
        await tx.wait();
      }
    } catch (e) { /* 忽略失败，前端状态仍保留 */ }
  };
  const toggleStar = () => {
    const starKey = `chainlyrics:starred:${numericId}`;
    const next = !starred;
    setStarred(next);
    try { localStorage.setItem(starKey, next ? "1" : "0"); } catch {}
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/explore" className="text-gray-400 hover:text-white mb-6 inline-block">
            ← 返回探索
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-4xl font-display font-bold gradient-text mb-4">
                      {song?.title || `#${id}`}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      {song?.createdAt ? (
                      <span>Created at {new Date(song.createdAt * 1000).toISOString().slice(0, 10)}</span>
                      ) : (
                        <span>创作信息加载中</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`glass-button ${liked ? "!text-red-400" : ""}`}
                      onClick={toggleLike}
                    >
                      {liked ? "❤️" : "🤍"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`glass-button ${starred ? "!text-yellow-300" : ""}`}
                      onClick={toggleStar}
                    >
                      {starred ? "⭐" : "☆"}
                    </motion.button>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6">
                  {audioUrl ? (
                    <audio controls src={audioUrl} className="w-full" />
                  ) : (
                    <div className="text-gray-400">暂无音频</div>
                  )}
                </div>
              </motion.div>

              {/* Lyrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="mr-2">📝</span> 歌词
                </h2>
                <div className="bg-white/5 rounded-xl p-6">
                  <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm leading-relaxed">
                    {lyrics || "歌词加载中..."}
                  </pre>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href={`/song/${id}/collab`} className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-purple-500/50 transition-all text-center">
                    🎨 Request Collab
                  </Link>
                  <Link href={`/song/${id}/tip`} className="glass-button text-center">
                    💰 Tip Author
                  </Link>
                  <Link href={`/song/${id}/mint`} className="glass-button text-center">
                    🎭 Mint NFT
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Creator */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-bold mb-4">👤 创作者</h3>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {(song?.creator || "0x").slice(2, 4).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm truncate">{song?.creator}</div>
                    <div className="text-xs text-gray-400">原作者</div>
                  </div>
                </div>
                <button className="w-full glass-button text-sm">
                  关注
                </button>
              </motion.div>

              {/* Collaborators */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-bold mb-4">👥 协作者</h3>
                <div className="space-y-3">
                  {(collaborators || []).map((addr, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          {addr.slice(2, 4).toUpperCase()}
                        </div>
                        <span className="font-mono text-sm">{addr}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-bold mb-4">📊 数据</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">浏览量</span>
                    <span className="font-semibold">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">收藏</span>
                    <span className="font-semibold">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">分润总额</span>
                    <span className="font-semibold gradient-text">{revenueTotal} ETH</span>
                  </div>
                </div>
              </motion.div>

              {/* Chain Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 bg-gradient-to-br from-green-600/10 to-emerald-600/10"
              >
                <h3 className="text-lg font-bold mb-4">🔗 链上信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Song ID</span>
                    <span className="font-mono">#{id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">网络</span>
                    <span>{chainId ?? "--"}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-3 break-all">
                    IPFS: {song?.lyricsCID || "--"}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

