'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/dashboard/Header'
import StatsCard from '@/components/dashboard/StatsCard'
import Card from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import {
  Package, Wrench, MapPin, ArrowLeftRight,
  Activity, Settings, XCircle, Inbox, MoreVertical,
} from 'lucide-react'

export default function DashboardPage() {
  const [materials, setMaterials] = useState([])
  const [equipment, setEquipment] = useState([])
  const [locations, setLocations] = useState([])
  const [movements, setMovements] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [mat, eq, loc, mov, log] = await Promise.all([
          supabase.from('materials').select('*'),
          supabase.from('equipment').select('*'),
          supabase.from('locations').select('*'),
          supabase.from('movements').select('*').order('date', { ascending: false }).limit(10),
          supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(15),
        ])
        setMaterials(mat.data || [])
        setEquipment(eq.data || [])
        setLocations(loc.data || [])
        setMovements(mov.data || [])
        setLogs(log.data || [])
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-[#9DA7B3]">Loading...</span>
      </div>
    )
  }

  const totalMatVal = materials.reduce((s, m) => s + (m.price || 0) * (m.quantity || 0), 0)
  const totalEqVal = equipment.reduce((s, e) => s + (e.price || 0), 0)

  const eqByStatus = equipment.reduce((a, e) => {
    const st = e.status || 'Unknown'
    a[st] = (a[st] || 0) + 1
    return a
  }, {})

  const locById = {}
  const locByName = {}

  locations.forEach(l => {
    locById[l.id] = l
    locByName[l.name] = l
  })

  const resolveLoc = (ref) => locById[ref] || locByName[ref] || null

  const matByLoc = {}
  materials.forEach(m => {
    const loc = resolveLoc(m.current_location)
    const key = loc ? loc.id : 'unassigned'
    if (!matByLoc[key]) matByLoc[key] = { items: 0, qty: 0 }
    matByLoc[key].items++
    matByLoc[key].qty += m.quantity || 0
  })

  const eqByLoc = {}
  equipment.forEach(e => {
    const loc = resolveLoc(e.current_location)
    const key = loc ? loc.id : 'unassigned'
    eqByLoc[key] = (eqByLoc[key] || 0) + 1
  })

  const statusColors = {
    available: 'bg-success',
    'in-use': 'bg-primary',
    maintenance: 'bg-warning',
    damaged: 'bg-danger',
    unknown: 'bg-muted',
  }

  const getStatusColor = (s) =>
    statusColors[(s || '').toLowerCase()] || 'bg-muted'

  return (
    <div className="flex flex-col gap-6">

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard icon={Package} label="Materials" value={materials.length} sub={fmtCur(totalMatVal) + ' value'} />
        <StatsCard icon={Wrench} label="Equipment" value={equipment.length} sub={fmtCur(totalEqVal) + ' value'} />
        <StatsCard icon={MapPin} label="Locations" value={locations.length} sub={`${locations.filter(l => l.type === 'plot').length} plots, ${locations.filter(l => l.type === 'site').length} sites`} />
        <StatsCard icon={ArrowLeftRight} label="Movements" value={movements.length} sub="Recent transfers" />
      </div>

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* STOCK BY LOCATION */}
        <Card className="flex flex-col gap-4 min-h-[360px]">
          <Header title="Stock by Location" />

          <div className="flex flex-col gap-6 overflow-y-auto">
            {locations.map(loc => {
              const md = matByLoc[loc.id] || { items: 0, qty: 0 }
              const ec = eqByLoc[loc.id] || 0
              const dot =
                loc.type === 'plot'
                  ? 'bg-primary'
                  : loc.type === 'site'
                  ? 'bg-success'
                  : 'bg-warning'

              return (
                <Card key={loc.id} className="flex flex-col gap-4 hover:bg-[#1A1F26] transition">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${dot}`} />
                      <div>
                        <p className="font-semibold">{loc.name}</p>
                        <p className="text-xs text-[#9DA7B3] uppercase">{loc.type}</p>
                      </div>
                    </div>
                    <MoreVertical size={18} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Metric val={md.items} label="Materials" />
                    <Metric val={ec} label="Equipment" />
                    <Metric val={md.qty} label="Total Qty" />
                  </div>
                </Card>
              )
            })}
          </div>
        </Card>

        {/* EQUIPMENT STATUS */}
        <Card className="flex flex-col gap-4 min-h-[360px]">
          <Header title="Equipment Status" />

          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold">{equipment.length}</p>
              <p className="text-sm text-[#9DA7B3]">Total Items</p>
            </div>

            <div className="flex h-3 rounded-full overflow-hidden bg-[#1C2128]">
              {Object.entries(eqByStatus).map(([st, ct]) => (
                <div
                  key={st}
                  className={getStatusColor(st)}
                  style={{ width: `${(ct / equipment.length) * 100}%` }}
                />
              ))}
            </div>

            {Object.entries(eqByStatus).map(([st, ct]) => (
              <div key={st} className="flex justify-between">
                <span className="text-sm text-[#9DA7B3]">{st}</span>
                <span className="font-semibold">{ct}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ACTIVITY */}
        <Card className="flex flex-col gap-4 min-h-[360px]">
          <Header title="Recent Activity" />

          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center gap-3">
              <Inbox size={28} className="text-[#9DA7B3]" />
              <p>No activity yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <ActivityIcon action={log.action} />
                  <div className="flex-1">
                    <p className="text-sm">{log.action}</p>
                    <p className="text-xs text-[#9DA7B3]">{fmtTime(log.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}

function Metric({ val, label }) {
  return (
    <div>
      <p className="text-xl font-semibold">{val}</p>
      <p className="text-xs text-[#9DA7B3]">{label}</p>
    </div>
  )
}

function ActivityIcon({ action }) {
  const a = (action || '').toLowerCase()
  if (a.includes('add')) return <Package size={16} />
  if (a.includes('edit')) return <Settings size={16} />
  if (a.includes('delete')) return <XCircle size={16} />
  if (a.includes('move')) return <ArrowLeftRight size={16} />
  return <Activity size={16} />
}

function fmtCur(v) {
  if (!v) return '\u20B90'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(v)
}

function fmtTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString()
}