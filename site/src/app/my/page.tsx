"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useWallet } from "@/providers/WalletProvider";
import { ethers } from "ethers";
import { getLyricsRegistryContract, getRevenueSplitContract, getCollaborationManagerContract } from "@/lib/contracts";

export default function MyPage() {
  const { address, connect } = useWallet();
  const [activeTab, setActiveTab] = useState<"created" | "collaborated" | "liked">("created");
  const [chainId, setChainId] = useState<number | undefined>();
  const [createdSongs, setCreatedSongs] = useState<Array<{ id: number; title: string }>>([]);
  const [collaboratedSongs, setCollaboratedSongs] = useState<Array<{ id: number; title: string }>>([]);
  const [withdrawableEth, setWithdrawableEth] = useState<string>("0.0");
  const [totalRevenue, setTotalRevenue] = useState<string>("0.0");
  const [withdrawn, setWithdrawn] = useState<string>("0.0");
  const [withdrawing, setWithdrawing] = useState(false);

  const displayAddress = address
    ? `${address.slice(0, 10)}...${address.slice(-8)}`
    : "未连接钱包";

  useEffect(() => {
    const eth = (globalThis as any).ethereum as ethers.Eip1193Provider | undefined;
    if (!eth) return;
    eth.request?.({ method: "eth_chainId" }).then((cid: any) => setChainId(parseInt(String(cid), 16)));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!address || !chainId) return;
        const eth = (globalThis as any).ethereum as ethers.Eip1193Provider | undefined;
        if (!eth) return;
        const web3 = new ethers.BrowserProvider(eth);
        const signer = await web3.getSigner();

        // 1) 查询我创建的作品（通过事件扫描）
        try {
          const registry = getLyricsRegistryContract(signer, chainId);
          const createdFilter = registry.filters.SongCreated(null, address);
          const logs = await registry.queryFilter(createdFilter, 0, "latest");
          const items: Array<{ id: number; title: string }> = logs.map((l: any) => ({ id: Number(l.args?.songId), title: String(l.args?.title) }));
          setCreatedSongs(items);
        } catch {}

        // 1.2) 查询我参与协作的作品：
        try {
          const registry = getLyricsRegistryContract(signer, chainId);
          const cm = getCollaborationManagerContract(signer, chainId);
          const joined = await cm.queryFilter(cm.filters.Joined(null, address), 0, "latest");
          const songIds = new Set<number>(joined.map((e: any) => Number(e.args?.songId)));
          // 兼容：如果作品在 Registry.collaborators 里已包含我（作为初始协作者），也计入
          const allCreated = await registry.queryFilter(registry.filters.SongCreated(), 0, "latest");
          for (const ev of allCreated) {
            const sid = Number(ev.args?.songId);
            const s = await registry.getSong(sid);
            const hasMe = (s.collaborators as string[]).some((x) => x.toLowerCase() === address.toLowerCase());
            if (hasMe && s.creator.toLowerCase() !== address.toLowerCase()) {
              songIds.add(sid);
            }
          }
          const results: Array<{ id: number; title: string }> = [];
          for (const sid of Array.from(songIds)) {
            const s = await registry.getSong(sid);
            results.push({ id: sid, title: String(s.title) });
          }
          setCollaboratedSongs(results);
        } catch {}

        // 2) 查询可提现余额（ETH）
        try {
          const rev = getRevenueSplitContract(signer, chainId);
          const bal = await rev.getBalance(address, ethers.ZeroAddress);
          setWithdrawableEth(ethers.formatEther(bal));
        } catch {}

        // 3) 统计总收益(给当前账户的累计 Credited) & 已提现（基于事件）
        try {
          const rev = getRevenueSplitContract(signer, chainId);
          const creditedLogs = await rev.queryFilter(rev.filters.Credited(null, address), 0, "latest");
          const total = creditedLogs
            .filter((l: any) => (l.args?.token as string).toLowerCase() === ethers.ZeroAddress.toLowerCase())
            .reduce((acc: bigint, l: any) => acc + (l.args?.amount as bigint), 0n);
          setTotalRevenue(ethers.formatEther(total));

          const wdLogs = await rev.queryFilter(rev.filters.Withdrawn(address, ethers.ZeroAddress, null), 0, "latest");
          const wsum = wdLogs.reduce((acc: bigint, l: any) => acc + (l.args?.amount as bigint), 0n);
          setWithdrawn(ethers.formatEther(wsum));
        } catch {}
      } catch {}
    })();
  }, [address, chainId]);

  const onWithdraw = async () => {
    try {
      if (!address) await connect();
      const eth = (globalThis as any).ethereum as ethers.Eip1193Provider | undefined;
      if (!eth || !chainId) throw new Error("钱包未连接");
      const web3 = new ethers.BrowserProvider(eth);
      const signer = await web3.getSigner();
      const rev = getRevenueSplitContract(signer, chainId);
      setWithdrawing(true);
      const tx = await rev.withdraw(ethers.ZeroAddress);
      await tx.wait();
      // 重新拉取可提现余额与已提现
      const bal = await rev.getBalance(address!, ethers.ZeroAddress);
      setWithdrawableEth(ethers.formatEther(bal));
          const wdLogs = await rev.queryFilter(rev.filters.Withdrawn(address!), 0, "latest");
          const wdLogsEth = wdLogs.filter((l: any) => (l.args?.token as string).toLowerCase() === ethers.ZeroAddress.toLowerCase());
          const wsum = wdLogsEth.reduce((acc: bigint, l: any) => acc + (l.args?.amount as bigint), 0n);
      setWithdrawn(ethers.formatEther(wsum));
      alert(`提现成功: ${tx.hash}`);
    } catch (e: any) {
      alert(`提现失败: ${e?.message || e}`);
    } finally {
      setWithdrawing(false);
    }
  };

  const myCreations = [
    { id: 1, title: "星空下的约定", collaborators: 5, likes: 128, revenue: "2.5 ETH" },
    { id: 2, title: "未来之光", collaborators: 2, likes: 67, revenue: "1.2 ETH" },
  ];

  const myCollaborations = [
    { id: 3, title: "回忆的旋律", owner: "0x9f3e...4b7c", contribution: 25, revenue: "0.5 ETH" },
    { id: 4, title: "城市夜行者", owner: "0x1a2b...9c8d", contribution: 30, revenue: "0.8 ETH" },
  ];

  const likedSongs = [
    { id: 5, title: "雨后彩虹", creator: "0x8c4d...3a7e" },
    { id: 6, title: "午夜咖啡", creator: "0x2b7f...6d1c" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                0x
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-display font-bold gradient-text mb-2">
                  我的主页
                </h1>
                <div className="text-gray-400 font-mono mb-4">
                  {displayAddress}
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="glass-card px-4 py-2">
                    <div className="text-sm text-gray-400">Creations</div>
                    <div className="text-xl font-bold">{createdSongs.length}</div>
                  </div>
                  <div className="glass-card px-4 py-2">
                    <div className="text-sm text-gray-400">Collaborations</div>
                    <div className="text-xl font-bold">{collaboratedSongs.length}</div>
                  </div>
                  <div className="glass-card px-4 py-2">
                    <div className="text-sm text-gray-400">Total Revenue</div>
                    <div className="text-xl font-bold gradient-text">{totalRevenue} ETH</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-button"
                  onClick={() => connect().catch(() => {})}
                >
                  ⚙️ 设置
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  💰 提现
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-2 mb-8 inline-flex gap-2"
          >
            {[
              { key: "created", label: "📝 我的创作", count: createdSongs.length },
              { key: "collaborated", label: "👥 参与协作", count: collaboratedSongs.length },
            ].map((tab: any) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-purple-600 to-blue-600"
                    : "hover:bg-white/10"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </motion.div>

          {/* Content */}
          <div className="space-y-4">
            {activeTab === "created" && (
              <>
                {createdSongs.map((song, i) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-6 hover:bg-white/15 transition-all"
                  >
                    <Link href={`/song/${song.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2 hover:text-purple-400 transition-colors">
                            {song.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>链上作品 ID: {song.id}</span>
                          </div>
                        </div>
                        <SongRowRevenue songId={song.id} />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </>
            )}

            {activeTab === "collaborated" && (
              <>
                {collaboratedSongs.map((collab, i) => (
                  <motion.div
                    key={collab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-6 hover:bg-white/15 transition-all"
                  >
                    <Link href={`/song/${collab.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2 hover:text-purple-400 transition-colors">
                            {collab.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">链上作品 ID: {collab.id}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400 mb-1">可提现 ETH</div>
                          <div className="text-2xl font-bold gradient-text">{withdrawableEth}</div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </>
            )}
          </div>

          {/* Revenue Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8 mt-8 bg-gradient-to-br from-green-600/10 to-emerald-600/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">💰 收益统计</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-green-500/50 transition-all"
                onClick={onWithdraw}
                disabled={withdrawing}
              >
                {withdrawing ? "提现中..." : "提现到钱包"}
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6">
                <div className="text-sm text-gray-400 mb-2">可提现余额</div>
                <div className="text-3xl font-bold gradient-text">{withdrawableEth} ETH</div>
              </div>
              <div className="glass-card p-6">
                <div className="text-sm text-gray-400 mb-2">总收益</div>
                <div className="text-3xl font-bold">{totalRevenue} ETH</div>
              </div>
              <div className="glass-card p-6">
                <div className="text-sm text-gray-400 mb-2">已提现</div>
                <div className="text-3xl font-bold">{withdrawn} ETH</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SongRowRevenue({ songId }: { songId: number }) {
  const { address } = useWallet();
  const [chainId, setChainId] = useState<number | undefined>();
  const [amount, setAmount] = useState<string>("0.0");

  useEffect(() => {
    const eth = (globalThis as any).ethereum as ethers.Eip1193Provider | undefined;
    if (!eth) return;
    eth.request?.({ method: "eth_chainId" }).then((cid: any) => setChainId(parseInt(String(cid), 16)));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!address || !chainId) return;
        const eth = (globalThis as any).ethereum as ethers.Eip1193Provider | undefined;
        if (!eth) return;
        const web3 = new ethers.BrowserProvider(eth);
        const signer = await web3.getSigner();
        const rev = getRevenueSplitContract(signer, chainId);
        // 聚合该 songId 下分配给当前账户的金额（只对索引参数筛选）
        const logs = await rev.queryFilter(rev.filters.Credited(songId, address), 0, "latest");
        const total = logs.reduce((acc: bigint, l: any) => acc + (l.args?.amount as bigint), 0n);
        setAmount(ethers.formatEther(total));
      } catch {}
    })();
  }, [address, chainId, songId]);

  return (
    <div className="text-right">
      <div className="text-sm text-gray-400 mb-1">可提现 ETH</div>
      <div className="text-2xl font-bold gradient-text">{amount}</div>
    </div>
  );
}

