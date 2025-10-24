"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ethers } from "ethers";
import { getLyricsRegistryContract, getLikeRegistryContract, getCollaborationManagerContract } from "@/lib/contracts";
import { useWallet } from "@/providers/WalletProvider";

export default function ExplorePage() {
  const { provider, chainId } = useWallet();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState<Array<{ id: number; title: string; creator: string; collaborators: number; liked: boolean; likes: number }>>([]);
  const filteredSongs = useMemo(() => {
    let list = songs.slice();
    // 搜索：按标题或创作者地址
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((s) => s.title.toLowerCase().includes(q) || s.creator.toLowerCase().includes(q));
    }
    // 过滤/排序
    if (filter === "collab") {
      list = list.filter((s) => s.collaborators > 0);
    } else if (filter === "hot") {
      list = list.sort((a, b) => b.likes - a.likes);
    } else if (filter === "new") {
      list = list.sort((a, b) => b.id - a.id);
    }
    return list;
  }, [songs, filter, searchQuery]);

  useEffect(() => {
    (async () => {
      try {
        if (!provider || !chainId) return;
        const web3 = new ethers.BrowserProvider(provider);
        const signer = await web3.getSigner();
        const registry = getLyricsRegistryContract(signer, chainId);
        const cm = getCollaborationManagerContract(signer, chainId);
        const likesContract = getLikeRegistryContract(signer, chainId);
        const logs = await registry.queryFilter(registry.filters.SongCreated(), 0, "latest");
        const items: Array<{ id: number; title: string; creator: string; collaborators: number; liked: boolean; likes: number }> = [];
        for (const l of logs) {
          const id = Number(l.args?.songId);
          const s = await registry.getSong(id);
          const liked = (typeof window !== 'undefined') && localStorage.getItem(`chainlyrics:liked:${id}`) === '1';
          let likes = 0;
          try {
            const cnt = await likesContract.likeCount(id);
            likes = Number(cnt);
          } catch {}
          // 协作者：Registry.collaborators ∪ CM.Joined(songId, *)
          let collabCount = (s.collaborators as string[]).length;
          try {
            const evts = await cm.queryFilter(cm.filters.Joined(id), 0, "latest");
            const joined = new Set<string>(evts.map((e: any) => String(e.args?.member || e.args?.[1]).toLowerCase()));
            const regSet = new Set<string>((s.collaborators as string[]).map((a: string) => a.toLowerCase()));
            const union = new Set<string>([...regSet, ...joined]);
            collabCount = union.size;
          } catch {}
          items.push({ id, title: String(s.title), creator: String(s.creator), collaborators: collabCount, liked, likes });
        }
        setSongs(items.reverse());
      } catch {}
    })();
  }, [provider, chainId]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-display font-bold gradient-text mb-4">
              🔍 Explore
            </h1>
            <p className="text-gray-400 text-lg">
              Discover great music and lyrics on-chain
            </p>
          </motion.div>

          {/* Filters & Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search songs, creators..."
                    className="w-full bg-white/5 border border-white/20 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                {["all", "hot", "new", "collab"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === f
                        ? "bg-gradient-to-r from-purple-600 to-blue-600"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {f === "all" && "All"}
                    {f === "hot" && "🔥 Hot"}
                    {f === "new" && "✨ New"}
                    {f === "collab" && "👥 Collab"}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Songs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map((song, i) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Link href={`/song/${song.id}`}>
                  <div className="glass-card p-6 cursor-pointer group h-full">
                    {/* Cover */}
                    <div className="relative mb-4 aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-600/50 to-blue-600/50">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white/50 group-hover:text-white/80 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                      </div>
                      
                      {/* Play Button on Hover */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </motion.div>

                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors truncate">
                      {song.title}
                    </h3>
                    
                    <div className="text-sm text-gray-400 mb-3">
                      <span className="font-mono">{song.creator}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* 省略标签，数据来源链上暂无 */}
                    </div>

                    <div className="flex items-center justify-between text-sm pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-400">
                          👥 {song.collaborators}
                        </span>
                        {/* 点赞为占位，暂不展示 */}
                      </div>
                      <span className={`text-sm ${song.liked ? 'text-red-400' : 'text-gray-400'}`}>❤️ {song.likes}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-button"
            >
              加载更多作品
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

