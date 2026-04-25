"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

const items = [
  { name: "Dashboard", path: "/" },
  { name: "Materials", path: "/materials" },
  { name: "Movements", path: "/movements" },
  { name: "Equipment", path: "/equipment" },
  { name: "Analytics", path: "/analytics" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="w-64 p-6 bg-[#F1EEE8] border-r border-[#E5E5E5]">
      
      {/* LOGO */}
      <h1
        className="text-1xl mb-10 tracking-wider"
        style={{ fontFamily: "Milker, sans-serif" }}
      >
        Manuel Correya Engineering Contractors
      </h1>

      <div className="flex flex-col gap-2">
        {items.map((item) => {
  const active = pathname === item.path;

  return (
    <div
      key={item.path}
      onClick={() => router.push(item.path)}
      className="relative cursor-pointer px-4 py-2 rounded-xl"
    >
      {/* ACTIVE (PRIORITY) */}
      {active && (
        <motion.div
          layoutId="sidebar-pill"
          className="absolute inset-0 rounded-xl bg-[#3A7D5D]"
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 30,
          }}
        />
      )}

      {/* HOVER ONLY IF NOT ACTIVE */}
      {!active && (
        <div className="absolute inset-0 rounded-xl hover:bg-[#E8E2D8] transition duration-150" />
      )}

      {/* TEXT */}
      <span
        className={`relative z-10 transition-colors duration-200 ${
          active ? "text-white" : "text-[#1A1A1A]"
        }`}
      >
        {item.name}
      </span>
    </div>
  );
})}
      </div>
    </div>
  );
}