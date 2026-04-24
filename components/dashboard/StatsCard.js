import Card from '@/components/ui/Card'

export default function StatsCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="flex h-full min-h-[140px] min-w-0 flex-col justify-between gap-4 transition-colors duration-300 hover:bg-[#1A1F26]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-[#9DA7B3]">{label}</p>
          <span className="text-[36px] font-bold leading-none text-[#E6EDF3]">{value}</span>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#2A2F36] bg-page text-[#9DA7B3]">
          <Icon size={20} strokeWidth={1.5} />
        </div>
      </div>
      <p className="text-[13px] text-[#9DA7B3]">{sub}</p>
    </Card>
  )
}
