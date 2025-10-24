"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import Navbar from "@/components/Navbar";
import WaveAnimation from "@/components/WaveAnimation";
import Link from "next/link";
import { useWallet } from "@/providers/WalletProvider";

export default function HomePage() {
  const { address } = useWallet();

  const featuredSongs = [
    {
      id: 1,
      title: "星空下的约定",
      creator: "0x742d...35A1",
      collaborators: 5,
      likes: 128,
    },
    {
      id: 2,
      title: "城市夜行者",
      creator: "0x1a2b...9c8d",
      collaborators: 3,
      likes: 95,
    },
    {
      id: 3,
      title: "回忆的旋律",
      creator: "0x9f3e...4b7c",
      collaborators: 7,
      likes: 203,
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/30 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">让灵感不被埋没</span>
              <br />
              <span className="text-white">让共创者都被记录</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              去中心化歌词与音乐共创平台，每一次创作都上链存证，每一位贡献者都获得应有的回报
            </p>
            
            <div className="flex justify-center gap-4 mb-12">
              <Link href="/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all"
                >
                  🎵 立即创作
                </motion.button>
              </Link>
              <Link href="/explore">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-card px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all"
                >
                  🔍 探索作品
                </motion.button>
              </Link>
            </div>

            {/* Wave Animation */}
            <WaveAnimation className="h-20" />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { label: "创作总数", value: "1,234" },
              { label: "活跃创作者", value: "567" },
              { label: "共创分润", value: "89 ETH" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-card p-6 text-center"
              >
                <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Songs */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl font-display font-bold mb-4 gradient-text">
              ✨ 精选作品
            </h2>
            <p className="text-gray-400">发现优秀的音乐与歌词创作</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSongs.map((song, i) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="glass-card p-6 cursor-pointer group"
              >
                {/* Cover Placeholder */}
                <div className="relative mb-4 aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-600/50 to-blue-600/50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white/50 group-hover:text-white/80 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                  {song.title}
                </h3>
                <div className="text-sm text-gray-400 mb-4">
                  创作者: <span className="font-mono">{song.creator}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400">
                      👥 {song.collaborators} 协作者
                    </span>
                    <span className="text-gray-400">
                      ❤️ {song.likes}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-display font-bold mb-4">
                准备好开始创作了吗？
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                加入我们的共创社区，让你的音乐灵感在链上永存
              </p>
              <Link href="/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 px-12 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all"
                >
                  开始创作 →
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>© 2025 ChainLyrics. 基于 FHEVM 构建的去中心化音乐共创平台</p>
        </div>
      </footer>
    </div>
  );
}
