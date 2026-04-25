"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

const STATUS_OPTIONS = ["Available", "Active", "In Service"];

export default function EquipmentPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [sortBy, setSortBy] = useState("name");

  const [form, setForm] = useState({
    name: "",
    description: "",
    storage_location: "",
    status: "Available",
    condition: "",
    price: "",
    date_of_purchase: "",
    parts_to_note: "",
    last_return_date: "",
  });

  // ================= FETCH =================
  async function fetchItems() {
    const { data } = await supabase
      .from("equipment")
      .select("*")
      .order(sortBy, { ascending: true });

    setItems(data || []);
  }

  useEffect(() => {
    fetchItems();
  }, [sortBy]);

  // ================= HANDLERS =================
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      storage_location: "",
      status: "Available",
      condition: "",
      price: "",
      date_of_purchase: "",
      parts_to_note: "",
      last_return_date: "",
    });
  }

  async function addItem() {
    if (!form.name) return;

    await supabase.from("equipment").insert([
      {
        ...form,
        price: form.price ? Number(form.price) : null,
      },
    ]);

    resetForm();
    fetchItems();
  }

  async function saveEdit(id) {
    await supabase
      .from("equipment")
      .update({
        ...form,
        price: form.price ? Number(form.price) : null,
      })
      .eq("id", id);

    resetForm();
    fetchItems();
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      description: item.description || "",
      storage_location: item.storage_location || "",
      status: item.status || "Available",
      condition: item.condition || "",
      price: item.price || "",
      date_of_purchase: item.date_of_purchase || "",
      parts_to_note: item.parts_to_note || "",
      last_return_date: item.last_return_date || "",
    });
  }

  async function deleteItem(id) {
    await supabase.from("equipment").delete().eq("id", id);
    fetchItems();
  }

  const filtered = items.filter((e) =>
    e.name?.toLowerCase().includes(search.toLowerCase())
  );

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
          Equipment
        </h1>
        <p className="text-[#6B6B6B] mt-2 text-sm">
          Track tools, condition, and lifecycle
        </p>
      </motion.div>

      {/* CONTROLS */}
      <div className="flex gap-3 mb-6">
        <input
          placeholder="Search equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 squircle border bg-[#FAF9F6] flex-1"
        />

        <button onClick={() => setSortBy("name")} className="px-3 py-2 squircle border">
          Name
        </button>

        <button onClick={() => setSortBy("price")} className="px-3 py-2 squircle border">
          Price
        </button>
      </div>

      {/* FORM */}
      <div className="squircle bg-[#FAF9F6] p-6 mb-8 grid grid-cols-2 gap-3">

        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="px-3 py-2 border squircle"/>

        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} className="px-3 py-2 border squircle"/>

        <input name="storage_location" placeholder="Storage Location" value={form.storage_location} onChange={handleChange} className="px-3 py-2 border squircle"/>

        <select name="status" value={form.status} onChange={handleChange} className="px-3 py-2 border squircle">
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>

        <input name="condition" placeholder="Condition" value={form.condition} onChange={handleChange} className="px-3 py-2 border squircle"/>

        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} className="px-3 py-2 border squircle"/>

        <input type="date" name="date_of_purchase" value={form.date_of_purchase} onChange={handleChange} className="px-3 py-2 border squircle"/>

        <input type="date" name="last_return_date" value={form.last_return_date} onChange={handleChange} className="px-3 py-2 border squircle"/>

        <input name="parts_to_note" placeholder="Parts to note" value={form.parts_to_note} onChange={handleChange} className="px-3 py-2 border squircle col-span-2"/>

        {editingId ? (
          <>
            <button onClick={() => saveEdit(editingId)} className="bg-[#3A7D5D] text-white px-4 py-2 squircle">
              Save
            </button>
            <button onClick={resetForm} className="px-4 py-2 border squircle">
              Cancel
            </button>
          </>
        ) : (
          <button onClick={addItem} className="bg-[#3A7D5D] text-white px-4 py-2 squircle col-span-2">
            Add Equipment
          </button>
        )}

      </div>

      {/* LIST */}
      <div className="grid gap-4">
        {filtered.map((e) => (
          <div key={e.id} className="squircle bg-[#FAF9F6] p-5 flex justify-between">

            <div>
              <p className="font-semibold text-lg">{e.name}</p>
              <p className="text-sm text-[#6B6B6B]">{e.description}</p>

              <div className="flex gap-3 mt-3 text-xs text-[#6B6B6B] flex-wrap">
                <span>Status: {e.status}</span>
                <span>Condition: {e.condition || "—"}</span>
                <span>₹{e.price || "—"}</span>
                <span>Stored: {e.storage_location || "—"}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-sm">
              <button onClick={() => startEdit(e)} className="text-blue-500">
                Edit
              </button>
              <button onClick={() => deleteItem(e.id)} className="text-red-500">
                Delete
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}