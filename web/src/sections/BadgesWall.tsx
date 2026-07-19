import { useMemo, useState } from 'react'
import { useApp } from '@/store/AppContext'
import { BADGES, CATEGORIES, metalOf } from '@/data/badges'
import { BadgeCoin } from '@/components/Badge'
import { CategoryIcon } from '@/lib/icons'
import type { CategoryId } from '@/types'

export function BadgesWall() {
  const { state } = useApp()
  const [filter, setFilter] = useState<CategoryId | 'all'>('all')

  const earnedCount = Object.keys(state.earned).length
  const shown = useMemo(
    () => (filter === 'all' ? BADGES : BADGES.filter((b) => b.category === filter)),
    [filter],
  )

  return (
    <div className="px-5 pt-6 pb-28">
      <header className="mb-5 animate-fadein">
        <div className="text-[11px] tracking-[0.35em] text-[#8a7d6b]">ACHIEVEMENTS</div>
        <h1 className="font-serif-sc text-2xl font-bold text-[#2f2a24]">成就勋章</h1>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-[#e0d5c2] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#c49a3f] to-[#f54001] transition-all duration-700"
              style={{ width: `${(earnedCount / BADGES.length) * 100}%` }} />
          </div>
          <span className="text-xs text-[#8a7d6b] shrink-0">{earnedCount}/{BADGES.length}</span>
        </div>
        <p className="text-[11px] text-[#b0a284] mt-2">轻点勋章翻面 · 背面刻着最近获得日期</p>
      </header>

      {/* 类别筛选 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1 mb-4">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="全部" />
        {CATEGORIES.map((c) => (
          <FilterChip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)} label={c.name}
            icon={<CategoryIcon id={c.id} size={13} />} color={c.color} />
        ))}
      </div>

      {/* 勋章墙 */}
      <div className="grid grid-cols-3 gap-x-2 gap-y-5">
        {shown.map((b, i) => (
          <div key={b.id} className="flex flex-col items-center animate-fadein" style={{ animationDelay: `${(i % 9) * 0.04}s` }}>
            <BadgeCoin badge={b} earned={state.earned[b.id]} size={92} />
            <div className={`mt-2 text-center text-[11px] leading-tight ${state.earned[b.id] ? 'text-[#4f483e] font-medium' : 'text-[#b0a284]'}`}>
              {b.name}
            </div>
            <div className="text-[9px] text-[#b0a284] mt-0.5">
              {{ bronze: '青铜', silver: '白银', gold: '黄金', rose: '玫瑰金', obsidian: '曜石' }[metalOf(b.tier)]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, label, icon, color }: {
  active: boolean; onClick: () => void; label: string; icon?: React.ReactNode; color?: string
}) {
  return (
    <button onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs transition active:scale-95 ${
        active ? 'bg-[#2f2a24] text-[#ece4d9]' : 'bg-[#fffbf5] border border-[#e0d5c2] text-[#8a7d6b]'
      }`}
      style={!active && color ? { color } : undefined}>
      {icon}{label}
    </button>
  )
}
