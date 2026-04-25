"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;

      const isProtected = pathname !== "/login";

      if (!user && isProtected) {
        router.push("/login");
      } else if (user && pathname === "/login") {
        router.push("/");
      } else {
        setLoading(false);
      }
    }

    checkUser();
  }, [pathname]);

  if (loading) return null;

  return children;
}