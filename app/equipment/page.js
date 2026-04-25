'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'

export default function EquipmentPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    quantity: '',
    status: '',
    current_location: '',
  })
  const [editingId, setEditingId] = useState(null)
  const [sortBy, setSortBy] = useState('name')
  const [search, setSearch] = useState('')

  async function fetchItems() {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order(sortBy, { ascending: true })

    if (error) console.error(error)

    setItems(data || [])
  }

  useEffect(() => {
    fetchItems()
  }, [sortBy])

  function handleChange(e) {
    let value = e.target.value

    if (e.target.name === 'current_location') {
      value = value.trim().replace(/\b\w/g, c => c.toUpperCase())
    }

    setForm({ ...form, [e.target.name]: value })
  }

  function resetForm() {
    setForm({
      name: '',
      description: '',
      quantity: '',
      status: '',
      current_location: '',
    })
  }

  async function addItem() {
    if (!form.name) return

    const { error } = await supabase.from('equipment').insert([
      {
        name: form.name,
        description: form.description || null,
        quantity: form.quantity ? Number(form.quantity) : 0,
        status: form.status || null,
        current_location: form.current_location || null,
      },
    ])

    if (error) {
      console.error(error)
      alert(error.message)
    }

    resetForm()
    fetchItems()
  }

  function startEdit(item) {
    setEditingId(item.id)
    setForm({
      name: item.name || '',
      description: item.description || '',
      quantity: item.quantity || '',
      status: item.status || '',
      current_location: item.current_location || '',
    })
  }

  async function saveEdit(id) {
    const { error } = await supabase
      .from('equipment')
      .update({
        name: form.name,
        description: form.description || null,
        quantity: form.quantity ? Number(form.quantity) : 0,
        status: form.status || null,
        current_location: form.current_location || null,
      })
      .eq('id', id)

    if (error) console.error(error)

    setEditingId(null)
    resetForm()
    fetchItems()
  }

  async function deleteItem(id) {
    const { error } = await supabase.from('equipment').delete().eq('id', id)
    if (error) console.error(error)

    fetchItems()
  }

  const filtered = items.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">

      <h1 className="text-xl font-semibold">Equipment</h1>

      {/* CONTROLS */}
      <div className="flex gap-3">
        <input
          placeholder="Search equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded flex-1"
        />

        <button
          onClick={() => setSortBy('name')}
          className="px-3 py-1 bg-[#1C2128] rounded hover:bg-[#252b33] transition"
        >
          Name
        </button>

        <button
          onClick={() => setSortBy('quantity')}
          className="px-3 py-1 bg-[#1C2128] rounded hover:bg-[#252b33] transition"
        >
          Qty
        </button>
      </div>

      {/* ADD FORM */}
      <Card>
        <div className="grid grid-cols-2 gap-3">

          <input name="name" placeholder="Name" value={form.name} onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded" />

          <input name="description" placeholder="Description" value={form.description} onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded" />

          <input name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded" />

          <input name="status" placeholder="Status (Available / In Use)" value={form.status} onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded" />

          <input name="current_location" placeholder="Location" value={form.current_location} onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded" />

        </div>

        <button onClick={addItem}
          className="mt-4 bg-[#4C6EF5] px-4 py-2 rounded text-white hover:opacity-90 transition">
          Add Equipment
        </button>
      </Card>

      {/* LIST */}
      <div className="flex flex-col gap-4">

        {filtered.map((m) => (
          <Card key={m.id}>

            {editingId === m.id ? (
              <div className="grid grid-cols-2 gap-3">

                {['name','description','quantity','status','current_location'].map((field) => (
                  <input
                    key={field}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    className="bg-[#0E1116] border border-[#2A2F36] px-2 py-1 rounded"
                  />
                ))}

                <div className="flex gap-2 mt-2">
                  <button onClick={() => saveEdit(m.id)}
                    className="bg-green-600 px-3 py-1 rounded hover:opacity-90 transition">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="bg-gray-600 px-3 py-1 rounded hover:opacity-90 transition">
                    Cancel
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex flex-col gap-4 transition hover:scale-[1.01]">

                {/* TOP */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold">{m.name}</p>
                    <p className="text-sm text-[#9DA7B3]">
                      {m.description || 'No description'}
                    </p>
                  </div>

                  <div className="flex gap-3 text-sm">
                    <button onClick={() => startEdit(m)} className="text-blue-400 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => deleteItem(m.id)} className="text-red-400 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>

                {/* METRICS */}
                <div className="flex gap-3">

                  <div className="bg-[#1C2128] px-3 py-2 rounded-lg">
                    <p className="text-xs text-[#6B7280]">Qty</p>
                    <p>{m.quantity}</p>
                  </div>

                  <div className="bg-[#1C2128] px-3 py-2 rounded-lg">
                    <p className="text-xs text-[#6B7280]">Status</p>
                    <p>{m.status || '—'}</p>
                  </div>

                  <div className="bg-[#1C2128] px-3 py-2 rounded-lg">
                    <p className="text-xs text-[#6B7280]">Location</p>
                    <p>{m.current_location || '—'}</p>
                  </div>

                </div>

              </div>
            )}

          </Card>
        ))}

      </div>

    </div>
  )
}