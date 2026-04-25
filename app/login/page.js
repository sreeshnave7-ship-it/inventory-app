'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  async function handleSignup() {
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    const user = data.user

    if (user) {
      await supabase.from('profiles').insert([
        {
          id: user.id,
          email: user.email,
          role: 'worker',
        },
      ])
    }

    alert('Account created. You can now login.')
    setLoading(false)
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#0E1116]">

      <div className="bg-[#161B22] p-6 rounded-2xl border border-[#2A2F36] w-[320px] flex flex-col gap-4">

        <h1 className="text-lg font-semibold text-center">
          Login
        </h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-[#0E1116] border border-[#2A2F36] px-3 py-2 rounded"
        />

        <button
          onClick={handleLogin}
          className="bg-[#4C6EF5] py-2 rounded text-white"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>

        <button
          onClick={handleSignup}
          className="text-sm text-[#9DA7B3]"
        >
          Create Account
        </button>

      </div>

    </div>
  )
}