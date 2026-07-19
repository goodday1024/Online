import { useRef, useState } from 'react'
import type { PhotoEntry } from '@/types'
import { categoryById } from '@/data/badges'
import { CategoryIcon, UIIcon, UI } from '@/lib/icons'
import { Phonograph } from './Phonograph'
import { useApp } from '@/store/AppContext'

// 单条记录详情:照片(实况可长按播放)、AI 日记、碎碎念、留声机
export function EntryDetail({ entry }: { entry: PhotoEntry }) {
  const { dispatch } = useApp()
  const [live, setLive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const cat = categoryById(entry.category)

  const playLive = () => {
    if (!entry.video) return
    setLive(true)
    videoRef.current?.play()
  }
  const stopLive = () => {
    setLive(false)
    videoRef.current?.pause()
    if (videoRef.current) videoRef.current.currentTime = 0
  }

  return (
    <div className="space-y-4 animate-fadein">
      {/* 照片 / 实况 */}
      <div
        className="relative rounded-2xl overflow-hidden select-none"
        onPointerDown={playLive} onPointerUp={stopLive} onPointerLeave={stopLive}
      >
        <img src={entry.photo} alt="" className={`w-full block transition-opacity duration-300 ${live && entry.video ? 'opacity-0' : 'opacity-100'}`} />
        {entry.video && (
          <video ref={videoRef} src={entry.video} muted loop playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${live ? 'opacity-100' : 'opacity-0'}`} />
        )}
        {entry.video && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-black/45 text-white backdrop-blur">
            <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-[#f54001] animate-pulse' : 'bg-white/80'}`} />
            {live ? 'LIVE 播放中' : '实况 · 长按播放'}
          </div>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full text-white backdrop-blur"
          style={{ background: `${cat.color}cc` }}>
          <CategoryIcon id={cat.id} size={12} /> {cat.name}
        </div>
      </div>

      {/* AI 日记 */}
      {entry.diary && (
        <div className="rounded-2xl bg-[#fffbf5] border border-[#e0d5c2] p-5 paper-lines">
          <div className="flex items-center gap-2 text-[11px] tracking-[0.25em] text-[#8a7d6b] mb-2">
            <UIIcon d={UI.spark} size={13} className="text-[#f54001]" /> 端侧 AI 日记
          </div>
          <h3 className="font-serif-sc text-xl text-[#2f2a24] font-semibold mb-2">{entry.diaryTitle}</h3>
          <p className="font-serif-sc text-[15px] leading-8 text-[#4f483e]">{entry.diary}</p>
        </div>
      )}

      {/* 碎碎念 */}
      {entry.suishuinian ? (
        <button onClick={() => dispatch({ type: 'openSui', id: entry.id })}
          className="w-full text-left rounded-2xl bg-[#241f18] p-5 active:scale-[0.99] transition">
          <div className="text-[11px] tracking-[0.25em] text-[#c49a3f] mb-2">碎碎念</div>
          <p className="font-serif-sc text-[15px] leading-8 text-[#e8ddc8]">{entry.suishuinian}</p>
          <div className="mt-3 text-xs text-[#8a7d6b]">轻点回到粒子对话 ›</div>
        </button>
      ) : (
        <button onClick={() => dispatch({ type: 'openSui', id: entry.id })}
          className="w-full rounded-2xl border-2 border-dashed border-[#d8cbb4] p-5 text-center active:scale-[0.99] transition">
          <div className="text-[#f54001] font-medium text-sm">进入碎碎念模式</div>
          <div className="text-xs text-[#8a7d6b] mt-1">照片化作粒子,和 AI 语音聊聊,织成一篇碎碎念</div>
        </button>
      )}

      {/* 留声机 */}
      <Phonograph entry={entry} />
    </div>
  )
}
