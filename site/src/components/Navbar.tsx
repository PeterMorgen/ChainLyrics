"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useWallet } from "@/providers/WalletProvider";

export default function Navbar() {
  const { address, chainId, connect } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
          </div>
          <span className="font-display text-2xl font-bold gradient-text">
            ChainLyrics
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/explore" className="text-gray-300 hover:text-white transition-colors">
            Explore
          </Link>
          <Link href="/create" className="text-gray-300 hover:text-white transition-colors">
            Create
          </Link>
          <Link href="/my" className="text-gray-300 hover:text-white transition-colors">
            My
          </Link>
          
          {address ? (
            <div className="flex items-center space-x-3">
              <div className="glass-card px-4 py-2 text-sm">
                <div className="text-gray-400 text-xs">Network: {chainId || "Unknown"}</div>
                <div className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</div>
              </div>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={connect}
              className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Connect Wallet
            </motion.button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden glass-card p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-4 space-y-2"
        >
          <Link href="/explore" className="block glass-card px-4 py-2 hover:bg-white/20 transition-colors">
            Explore
          </Link>
          <Link href="/create" className="block glass-card px-4 py-2 hover:bg-white/20 transition-colors">
            Create
          </Link>
          <Link href="/my" className="block glass-card px-4 py-2 hover:bg-white/20 transition-colors">
            My
          </Link>
          {!address && (
            <button
              onClick={connect}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg font-semibold"
            >
              Connect Wallet
            </button>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}

