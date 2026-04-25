'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function MagneticButton({ children }) {
  const ref = useRef()

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    ref.current.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`
  }

  function handleLeave() {
    ref.current.style.transform = `translate(0px, 0px)`
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.95 }}
      className="
        px-5 py-2 rounded-xl
        bg-[#4C6EF5]
        text-white
        shadow-lg
      "
    >
      {children}
    </motion.button>
  )
}