"use client";

import { motion } from "framer-motion";

export default function WaveAnimation({ className = "" }: { className?: string }) {
  const bars = Array.from({ length: 40 }, (_, i) => i);
  
  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-purple-500 via-blue-500 to-purple-400 rounded-full"
          initial={{ height: 4 }}
          animate={{
            height: [4, Math.random() * 60 + 20, 4],
          }}
          transition={{
            duration: 1 + Math.random() * 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}





