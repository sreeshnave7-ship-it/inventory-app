'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function Panel({ children, className = '' }) {
  const ref = useRef()

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ref.current.style.setProperty('--x', `${x}px`)
    ref.current.style.setProperty('--y', `${y}px`)
  }

  function handleMouseLeave() {
    ref.current.style.setProperty('--x', `-9999px`)
    ref.current.style.setProperty('--y', `-9999px`)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className={`
        relative
        rounded-2xl
        p-6
        bg-[#050505]
        overflow-hidden
        ${className}
      `}
      style={{
        boxShadow: `
          0 20px 50px rgba(0,0,0,1),
          inset 0 0 0 rgba(255,255,255,0.02)
        `,
      }}
    >
      {/* OUTER EDGE LIGHT */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: `
            radial-gradient(
              200px circle at var(--x) var(--y),
              rgba(76,110,245,0.5),
              transparent 70%
            )
          `,
          filter: 'blur(18px)',
        }}
      />

      {/* GLASS SWEEP EFFECT */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="
          pointer-events-none
          absolute top-0 left-0
          h-full w-[40%]
          bg-gradient-to-r from-transparent via-white/10 to-transparent
          skew-x-[-20deg]
        "
      />

      {/* CONTENT */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}