"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { uploadToIPFS } from "@/lib/ipfs";
import { useWallet } from "@/providers/WalletProvider";
import { ethers } from "ethers";
import { getLyricsRegistryContract } from "@/lib/contracts";

export default function CreatePage() {
  const { provider, address, chainId, connect } = useWallet();
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleCreate = async () => {
    try {
      if (!address) {
        await connect();
      }
      if (!provider) throw new Error("Wallet not connected");

      setUploading(true);

      // 1) Upload lyrics to IPFS
      const lyricsBlob = new Blob([lyrics], { type: "text/plain;charset=utf-8" });
      const lyricsRes = await uploadToIPFS(lyricsBlob, `${title || "lyrics"}.md`);

      // 2) Optional: upload audio
      let audioCID = "";
      if (audioFile) {
        const audioRes = await uploadToIPFS(audioFile, audioFile.name);
        audioCID = audioRes.cid;
      }

      // 3) Call LyricsRegistry.createSong
      const web3 = new ethers.BrowserProvider(provider);
      const signer = await web3.getSigner();
      const registry = getLyricsRegistryContract(signer, chainId);

      const tx = await registry.createSong(
        title,
        lyricsRes.cid,
        audioCID,
        isCollaborative,
        []
      );
      const receipt = await tx.wait();

      alert(`Song created. Tx: ${tx.hash}`);
    } catch (e: any) {
      alert(`Create failed: ${e?.message || e}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link href="/" className="text-gray-400 hover:text-white mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-5xl font-display font-bold gradient-text mb-4">
              ✍️ Create Song
            </h1>
            <p className="text-gray-400 text-lg">
              Publish your creation on-chain and start collaboration.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="glass-card p-6">
                <label className="block text-sm font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your song a name..."
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div className="glass-card p-6">
                <label className="block text-sm font-semibold mb-2">Lyrics</label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Write your lyrics here...&#10;&#10;Markdown supported.&#10;&#10;Example:&#10;# Verse 1&#10;..."
                  rows={12}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none font-mono text-sm"
                />
                <div className="mt-2 text-xs text-gray-400">
                  {lyrics.length} chars
                </div>
              </div>

              <div className="glass-card p-6">
                <label className="block text-sm font-semibold mb-2">Upload Audio (optional)</label>
                <div
                  className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer"
                  onClick={() => inputRef.current?.click()}
                >
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-400 mb-2">Click to upload or drag files</p>
                  <p className="text-xs text-gray-500">MP3, WAV, MIDI (max 50MB)</p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="audio/mpeg,audio/wav,audio/midi"
                  className="hidden"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                />
                {audioFile && (
                  <div className="mt-3 text-sm text-gray-300">Selected: {audioFile.name}</div>
                )}
              </div>

              <div className="glass-card p-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCollaborative}
                    onChange={(e) => setIsCollaborative(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm">
                    <span className="font-semibold">Enable collaboration</span>
                    <span className="text-gray-400 block text-xs">Allow others to collaborate</span>
                  </span>
                </label>
              </div>
            </motion.div>

            {/* Right: Preview & Actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <span className="mr-2">👁️</span> Preview
                </h3>
                
                {title || lyrics ? (
                  <div className="space-y-4">
                    {title && (
                      <div>
                        <h2 className="text-2xl font-bold gradient-text">{title}</h2>
                      </div>
                    )}
                    {lyrics && (
                      <div className="bg-white/5 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
                          {lyrics}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Preview shows here once you start typing.</p>
                  </div>
                )}
              </div>

              <div className="glass-card p-6 bg-gradient-to-br from-purple-600/10 to-blue-600/10">
                <h3 className="text-lg font-bold mb-4">💡 Tips</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Stored on IPFS permanently</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Invite others when collaboration enabled</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Revenue is shared by ratio</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Requires a small amount of gas</span>
                  </li>
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={!title || !lyrics || uploading}
                className={`w-full py-4 rounded-xl font-semibold text-lg shadow-xl transition-all ${
                  !title || !lyrics || uploading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-purple-500/50"
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <span>🚀 Publish on-chain</span>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

