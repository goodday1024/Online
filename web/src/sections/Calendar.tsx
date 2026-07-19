import { useMemo, useRef, useState } from 'react'
import { useApp } from '@/store/AppContext'
import type { PhotoEntry } from '@/types'
import { UIIcon, UI } from '@/lib/icons'
import { EntryDetail } from '@/components/EntryDetail'

type DayView = { day: string; items: PhotoEntry[]; index: number; mode: 'stack' | 'detail' }

export function Calendar() {
  const { state } = useApp()
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [view, setView] = useState<DayView | null>(null)

  const byDay = useMemo(() => {
    const m = new Map<string, PhotoEntry[]>()
    for (const e of state.entries) {
      const arr = m.get(e.day) ?? []
      arr.push(e)
      m.set(e.day, arr)
    }
    return m
  }, [state.entries])

  const year = cursor.getFullYear(), month = cursor.getMonth()
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1)
      return d.toISOString().slice(0, 10)
    }),
  ]

  const shift = (n: number) => {
    const d = new Date(cursor)
    d.setMonth(d.getMonth() + n)
    setView(null)
    setCursor(d)
  }

  const openDay = (day: string) => {
    const items = byDay.get(day)
    if (items?.length) setView({ day, items, index: 0, mode: 'stack' })
  }

  return (
    <div className="px-5 pt-6 pb-28">
      <header className="flex items-center justify-between mb-5 animate-fadein">
        <div>
          <div className="text-[11px] tracking-[0.35em] text-[#8a7d6b]">ARCHIVE</div>
          <h1 className="font-serif-sc text-2xl font-bold text-[#2f2a24]">记忆日历</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => shift(-1)} className="cal-nav"><UIIcon d={UI.back} size={15} /></button>
          <span className="text-sm font-medium text-[#4f483e] w-24 text-center">{year}年{month + 1}月</span>
          <button onClick={() => shift(1)} className="cal-nav rotate-180"><UIIcon d={UI.back} size={15} /></button>
        </div>
      </header>

      <div className="grid grid-cols-7 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
          <div key={d} className="text-center text-[11px] text-[#b0a284] py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2">
        {cells.map((day, i) => {
          if (!day) return <div key={`x${i}`} />
          const items = byDay.get(day)
          const isToday = day === new Date().toISOString().slice(0, 10)
          return (
            <button key={day} onClick={() => openDay(day)} disabled={!items}
              className="aspect-square flex flex-col items-center justify-center relative active:scale-95 transition">
              {items ? (
                <>
                  {/* 堆叠的照片 */}
                  <span className="relative block w-10 h-10">
                    {items.slice(0, 3).map((e, j) => (
                      <img key={e.id} src={e.photo} alt=""
                        className="absolute inset-0 w-10 h-10 object-cover rounded-lg border-2 border-[#fffbf5] shadow-sm"
                        style={{ transform: `rotate(${(j - (Math.min(items.length, 3) - 1) / 2) * 9}deg) translateY(${-j * 2}px)`, zIndex: j }} />
                    ))}
                    {items.length > 1 && (
                      <span className="absolute -top-1.5 -right-1.5 z-10 min-w-4 h-4 px-0.5 rounded-full bg-[#f54001] text-white text-[9px] flex items-center justify-center font-semibold">
                        {items.length}
                      </span>
                    )}
                  </span>
                  <span className={`text-[9px] mt-1 ${isToday ? 'text-[#f54001] font-bold' : 'text-[#8a7d6b]'}`}>
                    {Number(day.slice(8))}
                  </span>
                </>
              ) : (
                <span className="text-xs text-[#d8cbb4]">{Number(day.slice(8))}</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6 text-center text-xs text-[#b0a284]">
        共归档 {state.entries.length} 张照片 · 轻点堆叠的日子展开回忆
      </div>

      {view && <DayOverlay view={view} setView={setView} />}
    </div>
  )
}

// ---- 日视图:堆叠展开 → 滑动切换 → 点击查看日记 ----
function DayOverlay({ view, setView }: { view: DayView; setView: (v: DayView | null) => void }) {
  const [dragX, setDragX] = useState(0)
  const startX = useRef<number | null>(null)
  const moved = useRef(false)

  const { items, index, mode } = view
  const current = items[index]

  const onDown = (e: React.PointerEvent) => { startX.current = e.clientX; moved.current = false }
  const onMove = (e: React.PointerEvent) => {
    if (startX.current === null) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 6) moved.current = true
    setDragX(dx)
  }
  const onUp = () => {
    if (startX.current === null) return
    if (dragX < -60 && index < items.length - 1) setView({ ...view, index: index + 1 })
    else if (dragX > 60 && index > 0) setView({ ...view, index: index - 1 })
    else if (!moved.current && mode === 'stack') setView({ ...view, mode: 'detail' })
    setDragX(0)
    startX.current = null
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" onClick={() => setView(null)}>
      <div className="absolute inset-0 bg-[#1c1813]/70 backdrop-blur-sm animate-fadein" />
      <div className="relative w-full max-w-[430px] max-h-[92vh] overflow-y-auto no-scrollbar bg-[#ece4d9] rounded-t-3xl animate-slideup"
        onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-[#ece4d9]/90 backdrop-blur px-5 pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[#d8cbb4] mx-auto mb-2" />
          <div className="flex items-center justify-between">
            <div>
              <div className="font-serif-sc font-bold text-lg text-[#2f2a24]">{view.day.slice(5).replace('-', '月')}日</div>
              <div className="text-[11px] text-[#8a7d6b]">{items.length} 张照片 · {mode === 'stack' ? '左右滑动切换,轻点查看' : '日记与碎碎念'}</div>
            </div>
            {mode === 'detail' && (
              <button onClick={() => setView({ ...view, mode: 'stack' })}
                className="text-xs px-3 py-1.5 rounded-full border border-[#d8cbb4] text-[#4f483e]">返回照片</button>
            )}
          </div>
        </div>

        {mode === 'stack' ? (
          <div className="px-5 pb-10 pt-2 overflow-hidden">
            {/* iMessage 式滑动 */}
            <div
              className="relative touch-pan-y select-none"
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            >
              <div className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(calc(${-index * 100}% + ${dragX}px))`, transitionDuration: dragX ? '0ms' : '300ms' }}>
                {items.map((e, i) => (
                  <div key={e.id} className="w-full shrink-0 px-1">
                    <div className={`rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(60,45,30,0.3)] ${i === index ? 'stack-in' : ''}`}
                      style={{ transform: i === index ? 'none' : 'scale(0.94)', transition: 'transform .3s' }}>
                      <img src={e.photo} alt="" className="w-full block pointer-events-none" draggable={false} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 指示点 */}
            <div className="flex justify-center gap-1.5 mt-4">
              {items.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-[#f54001]' : 'w-1.5 bg-[#d8cbb4]'}`} />
              ))}
            </div>
            <div className="text-center mt-4 text-xs text-[#8a7d6b]">
              「{current.diaryTitle}」 · 轻点照片读日记
            </div>
          </div>
        ) : (
          <div className="px-5 pb-10">
            <EntryDetail entry={current} />
          </div>
        )}
      </div>
    </div>
  )
}
