'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { executeMovement } from '@/lib/movementEngine'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import { useToast } from '@/components/ui/ToastProvider'

export default function RequestsPage() {
  const [requests, setRequests] = useState([])
  const [items, setItems] = useState([])
  const [role, setRole] = useState(null)
  const [user, setUser] = useState(null)
  const { addToast } = useToast()

  const [form, setForm] = useState({
    item_type: 'material',
    item_id: '',
    quantity: 1,
  })

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole(profile?.role)

      fetchRequests()
      fetchItems()
    }

    init()
  }, [])

  async function fetchRequests() {
    const { data } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })

    setRequests(data || [])
  }

  async function fetchItems() {
    const table =
      form.item_type === 'material' ? 'materials' : 'equipment'

    const { data } = await supabase.from(table).select('id, name')
    setItems(data || [])
  }

  useEffect(() => {
    fetchItems()
  }, [form.item_type])

  async function createRequest() {
  if (!form.item_id) {
    addToast('Select item', 'error')
    return
  }

  if (!form.quantity || Number(form.quantity) <= 0) {
    addToast('Enter valid quantity', 'error')
    return
  }

  const { error } = await supabase.from('requests').insert([
    {
      ...form,
      quantity: Number(form.quantity),
      requested_by: user.email,
    },
  ])

  if (error) {
    addToast(error.message, 'error')
    return
  }

  addToast('Request submitted', 'success')
  fetchRequests()
}

  // ✅ CLEAN APPROVAL USING ENGINE
  async function approveRequest(req) {
  try {
    const { error } = await supabase.rpc('approve_request_atomic', {
      p_request_id: req.id,
      p_user: user.email,
    })

    if (error) throw error

    addToast('Request approved', 'success')
    fetchRequests()

  } catch (err) {
    addToast(err.message, 'error')
  }
}

  async function rejectRequest(id) {
  const { error } = await supabase
    .from('requests')
    .update({ status: 'rejected' })
    .eq('id', id)

  if (error) {
    addToast(error.message, 'error')
    return
  }

  addToast('Request rejected', 'info')
  fetchRequests()
}

  return (
    <DashboardLayout>

      <div className="flex flex-col gap-6">

        <h1 className="text-xl font-semibold">
          Material Requests
        </h1>

        {role === 'worker' && (
          <Card>
            <select
              value={form.item_type}
              onChange={(e) =>
                setForm({ ...form, item_type: e.target.value })
              }
            >
              <option value="material">Material</option>
              <option value="equipment">Equipment</option>
            </select>

            <select
              value={form.item_id}
              onChange={(e) =>
                setForm({ ...form, item_id: e.target.value })
              }
            >
              <option value="">Select Item</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: e.target.value })
              }
            />

            <button
              onClick={createRequest}
              className="mt-4 bg-[#4C6EF5] px-4 py-2 rounded text-white"
            >
              Submit Request
            </button>
          </Card>
        )}

        {requests.map((r) => (
          <Card key={r.id}>

            <div className="flex justify-between">

              <div>
                <p>{r.item_type} • {r.quantity}</p>
                <p className="text-xs text-[#6B7280]">
                  {r.requested_by}
                </p>
              </div>

              <div className="flex gap-2">

                <span className="text-xs">{r.status}</span>

                {role === 'admin' && r.status === 'pending' && (
                  <>
                    <button
                      onClick={() => approveRequest(r)}
                      className="text-green-400 text-xs"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => rejectRequest(r.id)}
                      className="text-red-400 text-xs"
                    >
                      Reject
                    </button>
                  </>
                )}

              </div>

            </div>

          </Card>
        ))}

      </div>

    </DashboardLayout>
  )
}