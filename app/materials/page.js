'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: '',
    price: '',
    reason: '',
    current_location: '',
  })
  const [editingId, setEditingId] = useState(null)
  const [sortBy, setSortBy] = useState('name')

  // FETCH
  async function fetchMaterials() {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order(sortBy, { ascending: true })

    if (error) console.error('Fetch error:', error)

    setMaterials(data || [])
  }

  useEffect(() => {
    fetchMaterials()
  }, [sortBy])

  // INPUT CHANGE
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function resetForm() {
    setForm({
      name: '',
      description: '',
      quantity: '',
      unit: '',
      price: '',
      reason: '',
      current_location: '',
    })
  }

  // ADD
  async function addMaterial() {
    if (!form.name) return

    const { error } = await supabase.from('materials').insert([
      {
        name: form.name,
        description: form.description || null,
        quantity: form.quantity ? Number(form.quantity) : 0,
        unit: form.unit || null,
        price: form.price ? Number(form.price) : null,
        reason: form.reason || null,
        current_location: form.current_location || null,
      },
    ])

    if (error) console.error('Insert error:', error)

    resetForm()
    fetchMaterials()
  }

  // EDIT START
  function startEdit(item) {
    setEditingId(item.id)
    setForm({
      name: item.name || '',
      description: item.description || '',
      quantity: item.quantity || '',
      unit: item.unit || '',
      price: item.price || '',
      reason: item.reason || '',
      current_location: item.current_location || '',
    })
  }

  // SAVE EDIT
  async function saveEdit(id) {
    const { error } = await supabase
      .from('materials')
      .update({
        ...form,
        quantity: form.quantity ? Number(form.quantity) : 0,
        price: form.price ? Number(form.price) : null,
      })
      .eq('id', id)

    if (error) console.error('Update error:', error)

    setEditingId(null)
    resetForm()
    fetchMaterials()
  }

  // DELETE
  async function deleteMaterial(id) {
    const { error } = await supabase.from('materials').delete().eq('id', id)

    if (error) console.error('Delete error:', error)

    fetchMaterials()
  }

  return (
    <div className="flex flex-col gap-6">

      <h1 className="text-xl font-semibold">Materials</h1>

      {/* SORT */}
      <div className="flex gap-2">
        <button
          onClick={() => setSortBy('name')}
          className="px-3 py-1 bg-[#1C2128] rounded"
        >
          Sort by Name
        </button>
        <button
          onClick={() => setSortBy('quantity')}
          className="px-3 py-1 bg-[#1C2128] rounded"
        >
          Sort by Quantity
        </button>
      </div>

      {/* ADD FORM */}
      <Card>
        <div className="grid grid-cols-2 gap-3">

          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded"
          />

          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded"
          />

          <input
            name="quantity"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded"
          />

          <input
            name="unit"
            placeholder="Unit"
            value={form.unit}
            onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded"
          />

          <input
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded"
          />

          <input
            name="reason"
            placeholder="Reason"
            value={form.reason}
            onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded"
          />

          <input
            name="current_location"
            placeholder="Location ID"
            value={form.current_location}
            onChange={handleChange}
            className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded"
          />

        </div>

        <button
          onClick={addMaterial}
          className="mt-4 bg-[#4C6EF5] px-4 py-2 rounded text-white"
        >
          Add Material
        </button>
      </Card>

      {/* LIST */}
      <div className="flex flex-col gap-4">

        {materials.map((m) => (
          <Card key={m.id}>

            {editingId === m.id ? (
              <div className="grid grid-cols-2 gap-3">

                {[
                  'name',
                  'description',
                  'quantity',
                  'unit',
                  'price',
                  'reason',
                  'current_location',
                ].map((field) => (
                  <input
                    key={field}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    className="bg-[#0E1116] border border-[#2A2F36] px-2 py-1 rounded"
                  />
                ))}

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => saveEdit(m.id)}
                    className="bg-green-600 px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-600 px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex flex-col gap-4">

                {/* TOP */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold">{m.name}</p>
                    <p className="text-sm text-[#9DA7B3]">
                      {m.description || 'No description'}
                    </p>
                  </div>

                  <div className="flex gap-3 text-sm">
                    <button
                      onClick={() => startEdit(m)}
                      className="text-blue-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMaterial(m.id)}
                      className="text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* METRICS */}
                <div className="flex gap-3">

                  <div className="bg-[#1C2128] px-3 py-2 rounded-lg">
                    <p className="text-xs text-[#6B7280]">Qty</p>
                    <p className="font-medium">
                      {m.quantity} {m.unit || ''}
                    </p>
                  </div>

                  <div className="bg-[#1C2128] px-3 py-2 rounded-lg">
                    <p className="text-xs text-[#6B7280]">Price</p>
                    <p className="font-medium">
                      ₹{m.price ? Number(m.price).toFixed(2) : '0.00'}
                    </p>
                  </div>

                  <div className="bg-[#1C2128] px-3 py-2 rounded-lg">
                    <p className="text-xs text-[#6B7280]">Location</p>
                    <p className="font-medium">
                      {m.current_location || '—'}
                    </p>
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