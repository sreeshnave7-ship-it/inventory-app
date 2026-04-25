"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  const pathname = usePathname();

  if (pathname === "/login") return children;

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <motion.div
  key={pathname}
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1],
  }}
  className="flex-1 p-8"
>
  {children}
</motion.div>
    </div>
  );
}