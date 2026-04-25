'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Card({ children }) {
  const [hover, setHover] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.98 }}
      animate={{
        y: hover ? -4 : 0,
        boxShadow: hover
          ? '0 20px 60px rgba(0,0,0,0.6)'
          : '0 10px 30px rgba(0,0,0,0.3)',
      }}
      className="
        relative
        rounded-2xl
        p-4
        bg-[#161B22]/70
        border border-[#2A2F36]
        overflow-hidden
      "
    >
      {/* glow layer */}
      <div
        className="
          absolute inset-0 opacity-0 hover:opacity-100
          transition duration-300
          bg-gradient-to-br from-[#4C6EF5]/10 via-transparent to-transparent
        "
      />

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}