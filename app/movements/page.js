'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'

export default function MovementsPage() {
  const [movements, setMovements] = useState([])
  const [items, setItems] = useState([])
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    item_type: 'material',
    item_id: '',
    quantity: 1,
    movement_direction: 'OUT',
    user_name: '',
  })

  async function fetchMovements() {
    const { data, error } = await supabase
      .from('movements')
      .select('*')
      .order('date', { ascending: false })

    if (error) console.error(error)
    setMovements(data || [])
  }

  async function fetchItems() {
    const table =
      form.item_type === 'material' ? 'materials' : 'equipment'

    const { data, error } = await supabase
      .from(table)
      .select('id, name')

    if (error) {
      console.error(error)
      return
    }

    setItems(data || [])
  }

  useEffect(() => {
    fetchMovements()
  }, [])

  useEffect(() => {
    fetchItems()
  }, [form.item_type])

  function handleChange(e) {
    const { name, value } = e.target

    setForm({
      ...form,
      [name]:
        name === 'quantity'
          ? value === ''
            ? ''
            : Number(value)
          : value,
    })
  }

  function resetForm() {
    setForm({
      item_type: 'material',
      item_id: '',
      quantity: 1,
      movement_direction: 'OUT',
      user_name: '',
    })
  }

  function timeAgo(date) {
    const seconds = Math.floor(
      (new Date() - new Date(date)) / 1000
    )

    if (seconds < 60) return 'just now'
    if (seconds < 3600)
      return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400)
      return `${Math.floor(seconds / 3600)}h ago`

    return `${Math.floor(seconds / 86400)}d ago`
  }

  function formatMovement(m) {
    const item =
      m.item_type === 'material' ? 'Material' : 'Equipment'
    const qty = m.quantity || 1

    if (m.item_type === 'material') {
      return `${item} movement → ${qty} units`
    }

    if (m.item_type === 'equipment') {
      return `Equipment movement`
    }

    return 'Movement recorded'
  }

  async function addMovement() {
    if (!form.item_id) {
      alert('Please select an item')
      return
    }

    const qty = Number(form.quantity) || 1
    setLoading(true)

    // INSERT MOVEMENT
    const { error } = await supabase.from('movements').insert([
      {
        item_type: form.item_type,
        item_id: form.item_id,
        from_location: null,
        to_location: null,
        quantity: qty,
        user_name: form.user_name || 'admin',
      },
    ])

    if (error) {
      console.error(error)
      alert(error.message)
      setLoading(false)
      return
    }

    // MATERIAL LOGIC
    if (form.item_type === 'material') {
      const { data: material } = await supabase
        .from('materials')
        .select('*')
        .eq('id', form.item_id)
        .single()

      if (!material) {
        alert('Material not found')
        setLoading(false)
        return
      }

      let newQty = material.quantity || 0

      if (form.movement_direction === 'OUT') {
        newQty -= qty

        if (newQty < 0) {
          alert('Not enough stock')
          setLoading(false)
          return
        }
      }

      if (form.movement_direction === 'IN') {
        newQty += qty
      }

      await supabase
        .from('materials')
        .update({ quantity: newQty })
        .eq('id', form.item_id)
    }

    // EQUIPMENT LOGIC
    if (form.item_type === 'equipment') {
      if (form.movement_direction === 'OUT') {
        await supabase
          .from('equipment')
          .update({
            current_location: 'In Use',
            status: 'Active',
          })
          .eq('id', form.item_id)
      }

      if (form.movement_direction === 'IN') {
        await supabase
          .from('equipment')
          .update({
            current_location: 'Warehouse',
            status: 'Available',
          })
          .eq('id', form.item_id)
      }
    }

    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)

    resetForm()
    fetchMovements()
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">
        Stock Movements
      </h1>

      {success && (
        <div className="text-green-400 text-sm">
          Movement recorded successfully
        </div>
      )}

      {/* FORM */}
      <Card>
        <div className="grid grid-cols-2 gap-3">
          <select
            name="item_type"
            value={form.item_type}
            onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded"
          >
            <option value="material">Material</option>
            <option value="equipment">Equipment</option>
          </select>

          <select
            value={form.item_id}
            onChange={(e) =>
              setForm({
                ...form,
                item_id: e.target.value,
              })
            }
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded"
          >
            <option value="">Select Item</option>

            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <input
            name="quantity"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded"
          />

          <input
            name="user_name"
            placeholder="User"
            value={form.user_name}
            onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded"
          />
        </div>

        {/* DIRECTION BUTTONS */}
        <div className="flex gap-2 mt-4">
          {['OUT', 'IN'].map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  movement_direction: dir,
                })
              }
              className={`
                px-4 py-2 rounded-xl border text-sm

                ${
                  form.movement_direction === dir
                    ? 'bg-[#4C6EF5] text-white border-[#4C6EF5]'
                    : 'bg-[#161B22] border-[#2A2F36] text-gray-400'
                }

                transition-all duration-200
              `}
            >
              {dir}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={addMovement}
          disabled={loading}
          className="mt-4 bg-[#4C6EF5] px-4 py-2 rounded text-white hover:opacity-90 transition"
        >
          {loading ? 'Processing...' : 'Record Movement'}
        </button>
      </Card>

      {/* ACTIVITY LOG */}
      <div className="flex flex-col gap-4">
        {movements.map((m) => (
          <Card key={m.id}>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm">
                  {formatMovement(m)}
                </p>

                <p className="text-xs text-[#6B7280]">
                  {timeAgo(m.date)}
                </p>
              </div>

              <div className="flex gap-3 text-xs text-[#9DA7B3]">
                <span>
                  {m.item_type === 'material'
                    ? 'Material'
                    : 'Equipment'}
                </span>

                <span>•</span>

                <span>Qty: {m.quantity || 1}</span>

                <span>•</span>

                <span>{m.user_name || '—'}</span>
              </div>

              <p className="text-[10px] text-[#6B7280] truncate">
                {m.item_id}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}