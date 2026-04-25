'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

export default function ActivityPage() {
  const [tab, setTab] = useState('inventory')
  const [movements, setMovements] = useState([])
  const [materials, setMaterials] = useState([])
  const [equipment, setEquipment] = useState([])

  async function fetchData() {
    const { data: m1 } = await supabase
      .from('movements')
      .select('*')
      .order('date', { ascending: false })

    const { data: m2 } = await supabase.from('materials').select('*')
    const { data: m3 } = await supabase.from('equipment').select('*')

    setMovements(m1 || [])
    setMaterials(m2 || [])
    setEquipment(m3 || [])
  }

  // 🔁 LIVE AUTO REFRESH
  useEffect(() => {
    fetchData()

    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  // 📊 ANALYTICS
  const totalMovements = movements.length
  const totalStock = materials.reduce((acc, m) => acc + (m.quantity || 0), 0)
  const activeEquipment = equipment.filter(e => e.status === 'Active').length

  return (
    <div className="flex flex-col gap-8 p-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Operations Dashboard
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Real-time system activity & analytics
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 bg-[#161B22] p-1 rounded-xl border border-[#2A2F36] w-fit">
        {['inventory', 'movements'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative px-5 py-2 text-sm rounded-lg transition"
          >
            {tab === t && (
              <motion.div
                layoutId="tabHighlight"
                className="absolute inset-0 bg-[#4C6EF5] rounded-lg"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}

            <span className={`relative z-10 ${tab === t ? 'text-white' : 'text-gray-400'}`}>
              {t === 'inventory' ? 'Inventory' : 'Movements'}
            </span>
          </button>
        ))}
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-3 gap-6">

        {[{
          label: 'Total Movements',
          value: totalMovements
        },
        {
          label: 'Total Stock',
          value: totalStock
        },
        {
          label: 'Active Equipment',
          value: activeEquipment
        }].map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="
              bg-gradient-to-br from-[#161B22] to-[#1C2128]
              border border-[#2A2F36]
              rounded-2xl p-5
              shadow-[0_10px_40px_rgba(0,0,0,0.4)]
            "
          >
            <p className="text-xs text-[#6B7280]">{card.label}</p>
            <p className="text-2xl font-semibold mt-2">{card.value}</p>
          </motion.div>
        ))}

      </div>

      {/* INSIGHTS */}
      <div className="grid grid-cols-2 gap-4">

        <div className="bg-[#161B22] border border-[#2A2F36] rounded-2xl p-4">
          <p className="text-xs text-[#6B7280]">Insight</p>
          <p className="text-sm mt-2">
            {totalMovements > 20
              ? 'High activity detected today'
              : 'Normal activity levels'}
          </p>
        </div>

        <div className="bg-[#161B22] border border-[#2A2F36] rounded-2xl p-4">
          <p className="text-xs text-[#6B7280]">Stock Health</p>
          <p className="text-sm mt-2">
            {totalStock < 50
              ? 'Low stock warning'
              : 'Stock levels stable'}
          </p>
        </div>

      </div>

      {/* CONTENT */}
      <AnimatePresence mode="wait">

        {tab === 'inventory' && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-6"
          >

            {materials.length === 0 && (
              <div className="col-span-2 text-center text-[#6B7280] py-10">
                No inventory activity yet
              </div>
            )}

            {materials.map(m => (
              <motion.div
                key={m.id}
                whileHover={{ y: -3 }}
                className="bg-[#161B22] border border-[#2A2F36] rounded-2xl p-4"
              >
                <div className="flex justify-between">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-[#6B7280]">
                    Qty: {m.quantity}
                  </p>
                </div>
              </motion.div>
            ))}

            {equipment.map(e => (
              <motion.div
                key={e.id}
                whileHover={{ y: -3 }}
                className="bg-[#161B22] border border-[#2A2F36] rounded-2xl p-4"
              >
                <div className="flex justify-between">
                  <p className="font-medium">{e.name}</p>
                  <p className="text-xs text-[#6B7280]">
                    {e.status}
                  </p>
                </div>
              </motion.div>
            ))}

          </motion.div>
        )}

        {tab === 'movements' && (
          <motion.div
            key="movements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >

            {movements.length === 0 && (
              <div className="text-center text-[#6B7280] py-10">
                No movement activity yet
              </div>
            )}

            {movements.map(m => (
              <motion.div
                key={m.id}
                whileHover={{ scale: 1.01 }}
                className="bg-[#161B22] border border-[#2A2F36] rounded-2xl p-4"
              >
                <div className="flex justify-between">
                  <p className="text-sm font-medium">
                    {m.item_type === 'material'
                      ? 'Material Movement'
                      : 'Equipment Movement'}
                  </p>

                  <p className="text-xs text-[#6B7280]">
                    {timeAgo(m.date)}
                  </p>
                </div>

                <p className="text-xs text-[#9DA7B3] mt-2">
                  Qty: {m.quantity} • {m.user_name || '—'}
                </p>
              </motion.div>
            ))}

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  )
}