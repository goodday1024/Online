import { useMemo, useState } from 'react'
import { useApp } from '@/store/AppContext'
import { CATEGORIES } from '@/data/badges'
import { CategoryIcon, UIIcon, UI } from '@/lib/icons'
import { EntryDetail } from '@/components/EntryDetail'
import type { PhotoEntry } from '@/types'

const TITLES = ['初来乍到的旅人', '生活的记录者', '时光的收藏家', '世界观察员', '地球资深玩家', '行走的传奇']

export function Profile() {
  const { state } = useApp()
  const [memory, setMemory] = useState<PhotoEntry | null>(null)

  const stats = useMemo(() => {
    const days = new Set(state.entries.map((e) => e.day))
    const byCat = CATEGORIES.map((c) => ({
      cat: c,
      n: state.entries.filter((e) => e.category === c.id).length,
    })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n)
    const level = Math.min(TITLES.length, Math.floor(state.entries.length / 4) + 1)
    return { days: days.size, byCat, level, max: byCat[0]?.n ?? 1 }
  }, [state.entries])

  const exportData = () => {
    const data = state.entries.map(({ photo, video, voice, ...rest }) => ({
      ...rest,
      photo: photo.startsWith('data:') ? `[照片 ${Math.round(photo.length / 1024)}KB]` : photo,
      video: video ? '[实况视频]' : undefined,
      voice: voice ? '[录音]' : undefined,
    }))
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), entries: data }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `online-记忆存档-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  const randomMemory = () => {
    const pool = state.entries
    setMemory(pool[Math.floor(Math.random() * pool.length)])
  }

  return (
    <div className="px-5 pt-6 pb-28">
      <header className="animate-fadein">
        <div className="text-[11px] tracking-[0.35em] text-[#8a7d6b]">PLAYER</div>
        <h1 className="font-serif-sc text-2xl font-bold text-[#2f2a24]">玩家档案</h1>
      </header>

      {/* 玩家卡 */}
      <div className="mt-5 rounded-3xl bg-[#2f2a24] text-[#ece4d9] p-5 animate-fadein relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#f54001]/15" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#f54001] flex items-center justify-center font-serif-sc text-2xl font-bold">玩</div>
          <div>
            <div className="font-serif-sc font-bold text-lg">Lv.{stats.level} {TITLES[stats.level - 1]}</div>
            <div className="text-xs text-[#8a7d6b] mt-0.5">地球 Online · 不删档测试中</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          <Stat n={state.entries.length} label="记忆存档" />
          <Stat n={stats.days} label="在线天数" />
          <Stat n={Object.keys(state.earned).length} label="点亮勋章" />
        </div>
      </div>

      {/* 生活分布 */}
      <div className="mt-5 rounded-3xl bg-[#fffbf5] border border-[#e0d5c2] p-5 animate-fadein">
        <div className="text-sm font-medium text-[#4f483e] mb-4">你的生活,由什么组成</div>
        <div className="space-y-2.5">
          {stats.byCat.slice(0, 6).map(({ cat, n }) => (
            <div key={cat.id} className="flex items-center gap-3">
              <span style={{ color: cat.color }}><CategoryIcon id={cat.id} size={16} /></span>
              <span className="text-xs text-[#4f483e] w-10">{cat.name}</span>
              <div className="flex-1 h-2 rounded-full bg-[#f0e9db] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(n / stats.max) * 100}%`, background: cat.color }} />
              </div>
              <span className="text-[11px] text-[#8a7d6b] w-6 text-right">{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 随机回顾 */}
      <button onClick={randomMemory}
        className="mt-5 w-full rounded-3xl border border-[#e0d5c2] bg-[#fffbf5] p-5 text-left active:scale-[0.99] transition animate-fadein">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-[#4f483e]">时光机 · 随机回顾</div>
            <div className="text-xs text-[#8a7d6b] mt-1">从记忆库里打捞一天,送给现在的你</div>
          </div>
          <span className="w-10 h-10 rounded-full bg-[#f54001]/10 text-[#f54001] flex items-center justify-center">
            <UIIcon d={UI.spark} size={18} />
          </span>
        </div>
      </button>

      {/* 导出 */}
      <button onClick={exportData}
        className="mt-3 w-full rounded-3xl border border-[#e0d5c2] bg-[#fffbf5] p-5 text-left active:scale-[0.99] transition animate-fadein">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-[#4f483e]">导出记忆存档</div>
            <div className="text-xs text-[#8a7d6b] mt-1">JSON 格式 · 你的数据永远属于你</div>
          </div>
          <span className="w-10 h-10 rounded-full bg-[#4f483e]/8 text-[#4f483e] flex items-center justify-center">
            <UIIcon d={UI.export} size={18} />
          </span>
        </div>
      </button>

      <div className="mt-6 text-center text-[11px] leading-relaxed text-[#b0a284]">
        所有识别与生成均在端侧完成<br />照片与对话,从不上传云端
      </div>

      {/* 随机回顾抽屉 */}
      {memory && (
        <div className="fixed inset-0 z-40 flex items-end justify-center" onClick={() => setMemory(null)}>
          <div className="absolute inset-0 bg-black/40 animate-fadein" />
          <div className="relative w-full max-w-[430px] max-h-[88vh] overflow-y-auto no-scrollbar bg-[#ece4d9] rounded-t-3xl p-5 pb-10 animate-slideup"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-[#d8cbb4] mx-auto mb-4" />
            <div className="text-xs text-[#8a7d6b] mb-3">来自 {memory.day} 的回信</div>
            <EntryDetail entry={memory} />
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 py-3 text-center">
      <div className="font-serif-sc text-xl font-bold">{n}</div>
      <div className="text-[10px] text-[#8a7d6b] mt-0.5">{label}</div>
    </div>
  )
}
