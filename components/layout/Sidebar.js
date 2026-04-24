'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Wrench,
  ArrowLeftRight,
  ClipboardList,
} from 'lucide-react'

const navItems = [
  { href: '/', icon: LayoutDashboard },
  { href: '/materials', icon: Package },
  { href: '/equipment', icon: Wrench },
  { href: '/movements', icon: ArrowLeftRight },
  { href: '/logs', icon: ClipboardList },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-16 flex-col items-center bg-page border-r border-edge shrink-0">
        {/* Logo */}
        <div className="h-14 flex items-center justify-center">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Package size={16} className="text-white" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col items-center gap-8 pt-6">
          {navItems.map(({ href, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors duration-150 ${
                  active
                    ? 'bg-elevated text-white'
                    : 'text-muted hover:text-secondary hover:bg-elevated/60'
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
              </Link>
            )
          })}
        </nav>

        {/* User avatar */}
        <div className="pb-5">
          <div className="w-9 h-9 rounded-full bg-elevated border border-edge flex items-center justify-center text-[11px] font-semibold text-secondary">
            U
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-around h-16 bg-page border-t border-edge">
        {navItems.map(({ href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`w-12 h-12 flex items-center justify-center rounded-xl ${
                active ? 'text-white bg-elevated' : 'text-muted'
              }`}
            >
              <Icon size={20} strokeWidth={1.8} />
            </Link>
          )
        })}
      </nav>
    </>
  )
}
