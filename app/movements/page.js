"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { exportMovementsToExcel } from "@/lib/exportExcel";
import { useToast } from "@/components/ui/ToastProvider";
import { executeMovement } from "@/lib/movementEngine";

const LOCATION_TYPES = ["SUPPLIER", "PLOT", "SITE", "SERVICE"];

export default function MovementsPage() {
  const [movements, setMovements] = useState([]);
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  const { addToast } = useToast();

  const [form, setForm] = useState({
    item_type: "material",
    item_id: "",
    quantity: 1,
    from_location_type: "SUPPLIER",
    to_location_type: "PLOT",
    challan_number: "",
  });

  // ================= INIT =================
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  async function fetchMovements() {
    const { data } = await supabase
      .from("movements")
      .select("*")
      .order("date", { ascending: false });

    setMovements(data || []);
  }

  async function fetchItems() {
    const table =
      form.item_type === "material" ? "materials" : "equipment";

    const { data } = await supabase.from(table).select("id, name");
    setItems(data || []);
  }

  useEffect(() => {
    fetchMovements();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [form.item_type]);

  // ================= EXPORT =================
  async function handleExport() {
    if (!fromDate || !toDate) {
      addToast("Select date range", "error");
      return;
    }

    const { data, error } = await supabase
      .from("movements")
      .select("*")
      .gte("date", fromDate)
      .lte("date", toDate);

    if (error) {
      addToast(error.message, "error");
      return;
    }

    if (!data.length) {
      addToast("No data found", "info");
      return;
    }

    exportMovementsToExcel(data);
    addToast("Exported successfully", "success");
  }

  // ================= ADD =================
  async function addMovement() {
    if (!form.item_id) {
      addToast("Select item", "error");
      return;
    }

    const qty = Number(form.quantity);

    if (!qty || qty <= 0) {
      addToast("Enter valid quantity", "error");
      return;
    }

    try {
      await executeMovement({
        item_type: form.item_type,
        item_id: form.item_id,
        quantity: qty,
        from_location_type: form.from_location_type,
        to_location_type: form.to_location_type,
        user_name: user?.email || "unknown",
        challan_number: form.challan_number || null,
      });

      addToast("Movement recorded", "success");
      fetchMovements();
    } catch (err) {
      addToast(err.message, "error");
    }
  }

  // ================= FILTER =================
  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      m.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.item_type?.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType ? m.item_type === filterType : true;

    const matchesLocation = filterLocation
      ? m.from_location_type === filterLocation ||
        m.to_location_type === filterLocation
      : true;

    return matchesSearch && matchesType && matchesLocation;
  });

  return (
    <div className="min-h-screen p-8">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="text-5xl" style={{ fontFamily: "Milker" }}>
          Movements
        </h1>
        <p className="text-[#6B6B6B] mt-2 text-sm">
          Track and control stock flow across locations
        </p>
      </motion.div>

      {/* EXPORT */}
      <div className="squircle bg-[#FAF9F6] p-5 mb-6 flex flex-wrap gap-3 items-center">
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-2 border squircle"/>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-2 border squircle"/>
        <button onClick={handleExport} className="bg-[#3A7D5D] text-white px-4 py-2 squircle">
          Export Excel
        </button>
      </div>

      {/* FILTERS */}
      <div className="squircle bg-[#FAF9F6] p-5 mb-6 flex flex-wrap gap-3">
        <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 border squircle"/>
        
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border squircle">
          <option value="">All Types</option>
          <option value="material">Material</option>
          <option value="equipment">Equipment</option>
        </select>

        <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="px-3 py-2 border squircle">
          <option value="">All Locations</option>
          {LOCATION_TYPES.map((loc) => (
            <option key={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* ADD MOVEMENT */}
      <div className="squircle bg-[#FAF9F6] p-6 mb-8 flex flex-wrap gap-3">

        <select value={form.item_type} onChange={(e) => setForm({ ...form, item_type: e.target.value })} className="px-3 py-2 border squircle">
          <option value="material">Material</option>
          <option value="equipment">Equipment</option>
        </select>

        <select value={form.item_id} onChange={(e) => setForm({ ...form, item_id: e.target.value })} className="px-3 py-2 border squircle">
          <option value="">Select Item</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
  {i.name} ({form.item_type})
</option>
          ))}
        </select>

        <input placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="px-3 py-2 border squircle w-24"/>

        <select value={form.from_location_type} onChange={(e) => setForm({ ...form, from_location_type: e.target.value })} className="px-3 py-2 border squircle">
          {LOCATION_TYPES.map((l) => <option key={l}>{l}</option>)}
        </select>

        <select value={form.to_location_type} onChange={(e) => setForm({ ...form, to_location_type: e.target.value })} className="px-3 py-2 border squircle">
          {LOCATION_TYPES.map((l) => <option key={l}>{l}</option>)}
        </select>

        <input placeholder="Challan" value={form.challan_number} onChange={(e) => setForm({ ...form, challan_number: e.target.value })} className="px-3 py-2 border squircle"/>

        <button onClick={addMovement} className="bg-[#3A7D5D] text-white px-4 py-2 squircle">
          Record
        </button>

      </div>

      {/* LIST */}
      <div className="grid gap-4">
        {filteredMovements.map((m) => (
          <div key={m.id} className="squircle bg-[#FAF9F6] p-4 flex justify-between items-center">

            <div>
              <p className="text-xs text-[#A0A0A0]">
  {m.user_name} • {m.to_location_type}
</p>
              <p>
                {m.item_type.toUpperCase()} • Qty: {m.quantity}
              </p>
              <p className="text-xs text-[#A0A0A0]">
                {m.user_name}
              </p>
            </div>

            <div className="text-xs text-[#6B6B6B]">
              {m.date ? new Date(m.date).toLocaleDateString() : ""}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}