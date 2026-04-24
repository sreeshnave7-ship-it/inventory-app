import Sidebar from "../components/layout/Sidebar";
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0E1116] text-[#E6EDF3]">
        <div className="flex min-h-screen">

          {/* Sidebar */}
          <div className="w-20 border-r border-[#2A2F36]">
            <Sidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1">
            <div className="max-w-[1400px] mx-auto px-6 py-6">
              {children}
            </div>
          </main>

        </div>
      </body>
    </html>
  );
}