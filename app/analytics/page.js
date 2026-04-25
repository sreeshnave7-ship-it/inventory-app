"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

// ---------- CARD ----------
function InteractiveCard({ children, className = "", onClick }) {
  return (
    <div className="relative group">
      {/* UNDERGLOW */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-[60%] h-[36px] rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-200"
        style={{
          background: "rgba(58,125,93,0.25)",
        }}
      />

      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        onClick={onClick}
        className={`relative squircle p-6 bg-[#FAF9F6] cursor-pointer ${className}`}
        style={{
          boxShadow:
            "0 12px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ---------- COUNT ANIMATION ----------
function AnimatedNumber({ value }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {value}
    </motion.span>
  );
}

// ---------- PAGE ----------
export default function AnalyticsPage() {
  const router = useRouter();

  const [stats, setStats] = useState({
    stock: 0,
    movements: 0,
    equipment: 0,
    requests: 0,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { count: stock } = await supabase
        .from("materials")
        .select("*", { count: "exact", head: true });

      const { count: movements } = await supabase
        .from("movements")
        .select("*", { count: "exact", head: true });

      const { count: equipment } = await supabase
        .from("equipment")
        .select("*", { count: "exact", head: true });

      const { count: requests } = await supabase
        .from("requests")
        .select("*", { count: "exact", head: true });

      const mock = [
        { day: "M", value: 12 },
        { day: "T", value: 18 },
        { day: "W", value: 9 },
        { day: "T", value: 14 },
        { day: "F", value: 20 },
        { day: "S", value: 6 },
        { day: "S", value: 10 },
      ];

      setStats({
        stock: stock || 0,
        movements: movements || 0,
        equipment: equipment || 0,
        requests: requests || 0,
      });

      setChartData(mock);
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen p-8">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mb-10"
      >
        <h1
          className="text-5xl tracking-tight text-[#1A1A1A]"
          style={{ fontFamily: "Milker, sans-serif" }}
        >
          Analytics
        </h1>
        <p className="text-[#6B6B6B] mt-2 text-sm">
          Real-time operational insights
        </p>
      </motion.div>

      {/* STATS */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.12 },
          },
        }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {[
          { label: "Total Stock", value: stats.stock, route: "/materials" },
          { label: "Movements", value: stats.movements, route: "/movements" },
          { label: "Equipment", value: stats.equipment, route: "/equipment" },
          { label: "Requests", value: stats.requests, route: "/requests" },
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
          >
            <InteractiveCard onClick={() => router.push(item.route)}>
              <p className="text-sm text-[#6B6B6B]">{item.label}</p>
              <h2 className="text-4xl font-semibold mt-2 text-[#1A1A1A]">
                <AnimatedNumber value={item.value} />
              </h2>
            </InteractiveCard>
          </motion.div>
        ))}
      </motion.div>

      {/* CHART */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        <InteractiveCard>
          <p className="text-[#1A1A1A] font-medium mb-4 text-lg">
            Movement Trends
          </p>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" stroke="#A0A0A0" />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#3A7D5D"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </InteractiveCard>
      </div>
    </div>
  );
}