"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const units = ["pcs", "kg", "liters", "meters"];

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    quantity: "",
    unit: "pcs",
    price: "",
    reason: "",
    current_location: "",
  });

  // ================= INIT =================
  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const { data: locs } = await supabase
        .from("locations")
        .select("*");

      setLocations(locs || []);
      setRole(profile?.role);
      setLoading(false);
    }

    init();
  }, []);

  // ================= FETCH =================
  async function fetchMaterials() {
    const { data } = await supabase
      .from("materials")
      .select("*, locations(name)");

    setMaterials(data || []);
  }

  useEffect(() => {
    if (!loading) fetchMaterials();
  }, [loading]);

  // ================= HANDLERS =================
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      quantity: "",
      unit: "pcs",
      price: "",
      reason: "",
      current_location: "",
    });
  }

  async function addMaterial() {
    await supabase.from("materials").insert([
      {
        ...form,
        quantity: Number(form.quantity) || 0,
        price: Number(form.price) || 0,
      },
    ]);

    resetForm();
    fetchMaterials();
  }

  async function updateMaterial(id) {
    await supabase
      .from("materials")
      .update({
        ...form,
        quantity: Number(form.quantity),
        price: Number(form.price),
      })
      .eq("id", id);

    resetForm();
    fetchMaterials();
  }

  function startEdit(m) {
    setForm({
      name: m.name || "",
      description: m.description || "",
      quantity: m.quantity || "",
      unit: m.unit || "pcs",
      price: m.price || "",
      reason: m.reason || "",
      current_location: m.current_location || "",
    });
    setEditingId(m.id);
  }

  async function deleteMaterial(id) {
    if (role !== "admin") {
      alert("Only admins can delete materials");
      return;
    }

    await supabase.from("materials").delete().eq("id", id);
    fetchMaterials();
  }

  const filtered = materials.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return null;

  return (
    <div className="min-h-screen p-8">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mb-8"
      >
        <h1
          className="text-5xl tracking-tight text-[#1A1A1A]"
          style={{ fontFamily: "Milker" }}
        >
          Materials
        </h1>
        <p className="text-[#6B6B6B] mt-2 text-sm">
          Manage inventory, pricing, and locations
        </p>
      </motion.div>

      {/* SEARCH */}
      <input
        placeholder="Search materials..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 px-4 py-2 squircle border w-full max-w-md bg-[#FAF9F6]"
      />

      {/* FORM */}
      <div className="squircle bg-[#FAF9F6] p-6 mb-8 flex flex-wrap gap-3">

        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="px-3 py-2 border squircle"
        />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="px-3 py-2 border squircle flex-1"
        />

        <input
          name="quantity"
          placeholder="Qty"
          value={form.quantity}
          onChange={handleChange}
          className="px-3 py-2 border squircle w-24"
        />

        <select
          name="unit"
          value={form.unit}
          onChange={handleChange}
          className="px-3 py-2 border squircle"
        >
          {units.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>

        <input
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="px-3 py-2 border squircle w-28"
        />

        {/* LOCATION DROPDOWN (UUID BASED) */}
        <select
          name="current_location"
          value={form.current_location || ""}
          onChange={handleChange}
          className="px-3 py-2 border squircle"
        >
          <option value="">Select location</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>

        <input
          name="reason"
          placeholder="Reason"
          value={form.reason}
          onChange={handleChange}
          className="px-3 py-2 border squircle flex-1"
        />

        {editingId ? (
          <>
            <button
              onClick={() => updateMaterial(editingId)}
              className="bg-[#3A7D5D] text-white px-4 py-2 squircle"
            >
              Save
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 border squircle"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={addMaterial}
            className="bg-[#3A7D5D] text-white px-4 py-2 squircle"
          >
            Add
          </button>
        )}
      </div>

      {/* LIST */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.12 } },
        }}
        className="grid gap-4"
      >
        {filtered.length === 0 && (
          <p className="text-[#6B6B6B] text-sm">No materials found.</p>
        )}

        {filtered.map((m) => (
          <motion.div
            key={m.id}
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
            className="relative group"
          >
            {/* UNDERGLOW */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-[60%] h-[36px] rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition"
              style={{ background: "rgba(58,125,93,0.25)" }}
            />

            <div className="squircle bg-[#FAF9F6] p-4 flex justify-between items-center">

              <div>
                <p className="font-medium text-[#1A1A1A]">{m.name}</p>

                <p className="text-sm text-[#6B6B6B]">
                  {m.quantity} {m.unit} • ₹{m.price} •{" "}
                  {m.locations?.name || "No location"}
                </p>

                {m.reason && (
                  <p className="text-xs text-[#A0A0A0]">{m.reason}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => startEdit(m)}
                  className="text-sm text-blue-500"
                >
                  Edit
                </button>

                {role === "admin" && (
                  <button
                    onClick={() => deleteMaterial(m.id)}
                    className="text-sm text-red-500"
                  >
                    Delete
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}