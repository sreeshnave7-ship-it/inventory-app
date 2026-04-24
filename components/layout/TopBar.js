'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell, Mail } from 'lucide-react'

const titles = {
  '/': 'Dashboard',
  '/materials': 'Materials',
  '/equipment': 'Equipment',
  '/movements': 'Movements',
  '/logs': 'Activity Logs',
}

export default function TopBar() {
  const pathname = usePathname()
  const title = titles[pathname] || 'Dashboard'

  return (
    <header className="h-20 flex items-center justify-between px-10 bg-page shrink-0">
      <h1 className="text-[20px] font-semibold text-label">{title}</h1>

      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search size={16} className="text-muted" />
          </div>
          <input
            id="global-search"
            type="text"
            placeholder="Search..."
            className="w-[260px] h-10 rounded-full bg-surface border-none pl-12 pr-4 text-[14px] text-label placeholder-muted focus:ring-1 focus:ring-edge outline-none transition-all"
          />
        </div>

        {/* Icons */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface transition-colors">
          <Mail size={18} className="text-secondary" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface transition-colors">
          <Bell size={18} className="text-secondary" />
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-surface border border-edge flex items-center justify-center ml-2 overflow-hidden">
          <span className="text-[12px] font-semibold text-secondary">U</span>
        </div>
      </div>
    </header>
  )
}
