import Header from '@/components/dashboard/Header'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#0E1116] text-white">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <Header />

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

      </div>

    </div>
  )
}