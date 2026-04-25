'use client'

import { createContext, useContext, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  function addToast(message, type = 'info') {
    const id = Date.now()

    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  return (
    <ToastContext.Provider value={{ addToast }}>

      {children}

      {/* TOAST UI */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">

        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`
                px-4 py-2 rounded-lg text-sm shadow-lg
                ${t.type === 'error' ? 'bg-red-500' : ''}
                ${t.type === 'success' ? 'bg-green-500' : ''}
                ${t.type === 'info' ? 'bg-[#4C6EF5]' : ''}
              `}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>

      </div>

    </ToastContext.Provider>
  )
}