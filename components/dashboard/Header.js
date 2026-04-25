'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      const user = data.user

      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        setRole(profile?.role)
      }
    }

    loadUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="
      h-14
      border-b border-[#2A2F36]
      flex items-center justify-between
      px-6
      bg-[#161B22]
    ">
      
      <h1 className="text-sm font-medium">
        MCEC Inventory
      </h1>

      <div className="flex items-center gap-4">

        <div className="text-xs text-[#9DA7B3]">
          {user?.email}
          {role && (
            <span className="ml-2 text-[#4C6EF5]">
              ({role})
            </span>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="
            text-xs px-3 py-1 rounded-md
            bg-[#1C2128] hover:bg-[#2A2F36]
          "
        >
          Logout
        </button>

      </div>

    </div>
  )
}