import { useRef, useState } from 'react'
import { useApp } from '@/store/AppContext'
import { analyzeImage, generateDiary } from '@/lib/ai'
import { fileToImage, imageToDataURL } from '@/lib/demo'
import { categoryById } from '@/data/badges'
import { CategoryIcon, UIIcon, UI } from '@/lib/icons'
import { EntryDetail } from '@/components/EntryDetail'
import type { PhotoEntry } from '@/types'

const STEPS = ['读取像素…', '端侧视觉理解中…', '匹配成就体系…', '撰写日记…']

export function Home() {
  const { state, dispatch } = useApp()
  const photoInput = useRef<HTMLInputElement>(null)
  const liveInput = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(-1)
  const [fresh, setFresh] = useState<PhotoEntry | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)
  const streak = calcStreak(state.entries)
  const openEntry = state.entries.find((e) => e.id === openId)

  const handle = async (file: File, isLive: boolean) => {
    let photoURL: string
    let videoURL: string | undefined
    let analysis: ReturnType<typeof analyzeImage>

    if (isLive && file.type.startsWith('video')) {
      videoURL = URL.createObjectURL(file)
      photoURL = await grabPoster(videoURL)
      const img = await urlToImage(photoURL)
      analysis = analyzeImage(img)
    } else {
      const img = await fileToImage(file)
      photoURL = imageToDataURL(img)
      analysis = analyzeImage(img)
    }

    setStep(0)
    for (let i = 1; i <= STEPS.length; i++) {
      await sleep(520)
      setStep(i)
    }
    const { title, text } = generateDiary(analysis.category, analysis.sceneWords)
    const entry: PhotoEntry = {
      id: `e-${Date.now()}`,
      day: today,
      createdAt: Date.now(),
      photo: photoURL,
      video: videoURL,
      category: analysis.category,
      hue: analysis.hue,
      diary: text,
      diaryTitle: title,
      mood: 4,
    }
    dispatch({ type: 'add', entry })
    dispatch({ type: 'earn', category: analysis.category })
    setFresh(entry)
    setStep(-1)
    setTimeout(() => setFresh(null), 5200)
  }

  return (
    <div className="px-5 pt-6 pb-28">
      {/* 头部 */}
      <header className="flex items-end justify-between mb-6 animate-fadein">
        <div>
          <div className="text-[11px] tracking-[0.35em] text-[#8a7d6b]">EARTH ONLINE</div>
          <h1 className="font-serif-sc text-[34px] leading-tight text-[#2f2a24] font-bold">
            地球<span className="text-[#f54001]">·</span>Online
          </h1>
          <div className="text-xs text-[#8a7d6b] mt-1">{fmtDate(new Date())} · 第 {Math.max(1, state.entries.length)} 号玩家日志</div>
        </div>
        <div className="flex items-center gap-1.5 bg-[#fffbf5] border border-[#e0d5c2] rounded-full px-3 py-2">
          <UIIcon d={UI.flame} size={15} className="text-[#f54001]" />
          <span className="text-sm font-semibold text-[#4f483e]">{streak}</span>
          <span className="text-[11px] text-[#8a7d6b]">天</span>
        </div>
      </header>

      {/* 上传区 */}
      <div className="rounded-3xl bg-[#fffbf5] border border-[#e0d5c2] p-5 mb-6 animate-fadein">
        <div className="text-sm font-medium text-[#4f483e] mb-1">此刻的世界,值得存档</div>
        <div className="text-xs text-[#8a7d6b] mb-4">端侧大模型看懂照片,为你写日记、点亮成就</div>
        <div className="flex gap-3">
          <button onClick={() => photoInput.current?.click()}
            className="flex-1 h-14 rounded-2xl bg-[#f54001] text-white flex items-center justify-center gap-2 font-medium active:scale-[0.97] transition shadow-[0_8px_20px_rgba(245,64,1,0.25)]">
            <UIIcon d={UI.camera} size={20} /> 拍一张照片
          </button>
          <button onClick={() => liveInput.current?.click()}
            className="h-14 px-4 rounded-2xl border border-[#d8cbb4] text-[#4f483e] flex items-center gap-2 text-sm active:scale-[0.97] transition">
            <span className="w-2 h-2 rounded-full bg-[#f54001]" /> 实况
          </button>
        </div>
        <input ref={photoInput} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => e.target.files?.[0] && handle(e.target.files[0], false)} />
        <input ref={liveInput} type="file" accept="video/*,image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && handle(e.target.files[0], true)} />
      </div>

      {/* AI 刚生成的日记提示 */}
      {fresh && (
        <div className="rounded-2xl bg-[#2f2a24] text-[#ece4d9] p-4 mb-6 animate-slideup flex gap-3 items-start">
          <UIIcon d={UI.spark} size={18} className="text-[#c49a3f] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-xs text-[#8a7d6b] mb-0.5">端侧 AI 已生成日记 · 识别为「{categoryById(fresh.category).name}」</div>
            <div className="font-serif-sc font-semibold">{fresh.diaryTitle}</div>
            <button onClick={() => setOpenId(fresh.id)} className="text-xs text-[#c49a3f] mt-1.5 underline underline-offset-2">查看全文 ›</button>
          </div>
        </div>
      )}

      {/* 动态流 */}
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-serif-sc text-lg font-semibold text-[#2f2a24]">时光流</h2>
        <span className="text-xs text-[#8a7d6b]">{state.entries.length} 条存档</span>
      </div>
      <div className="space-y-3">
        {state.entries.map((e, i) => {
          const cat = categoryById(e.category)
          return (
            <button key={e.id} onClick={() => setOpenId(e.id)}
              className="w-full flex gap-3.5 items-center bg-[#fffbf5] border border-[#e0d5c2] rounded-2xl p-3 text-left active:scale-[0.99] transition animate-fadein"
              style={{ animationDelay: `${Math.min(i, 6) * 0.05}s` }}>
              <img src={e.photo} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-serif-sc font-semibold text-[#2f2a24] truncate">{e.diaryTitle}</span>
                  {e.video && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2f2a24] text-white shrink-0">LIVE</span>}
                  {e.voice && <UIIcon d={UI.vinyl} size={12} className="text-[#8a7d6b] shrink-0" />}
                </div>
                <div className="text-xs text-[#8a7d6b] mt-1 truncate font-serif-sc">{e.diary}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: cat.color }}>
                    <CategoryIcon id={cat.id} size={11} />{cat.name}
                  </span>
                  <span className="text-[10px] text-[#b0a284]">{e.day.slice(5).replace('-', '/')}</span>
                  {e.suishuinian && <span className="text-[10px] text-[#c49a3f]">· 有碎碎念</span>}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 分析中遮罩 */}
      {step >= 0 && (
        <div className="fixed inset-0 z-40 bg-[#ece4d9]/95 backdrop-blur flex flex-col items-center justify-center gap-6">
          <div className="ai-orb" />
          <div className="space-y-2 text-center">
            {STEPS.map((s, i) => (
              <div key={s} className={`text-sm transition-all duration-300 ${
                i < step ? 'text-[#b0a284] line-through' : i === step ? 'text-[#2f2a24] font-medium' : 'text-[#d8cbb4]'
              }`}>{s}</div>
            ))}
          </div>
          <div className="text-[10px] tracking-[0.3em] text-[#8a7d6b]">ON-DEVICE · 数据不出手机</div>
        </div>
      )}

      {/* 详情底部抽屉 */}
      {openEntry && (
        <div className="fixed inset-0 z-40 flex items-end justify-center" onClick={() => setOpenId(null)}>
          <div className="absolute inset-0 bg-black/40 animate-fadein" />
          <div className="relative w-full max-w-[430px] max-h-[88vh] overflow-y-auto no-scrollbar bg-[#ece4d9] rounded-t-3xl p-5 pb-10 animate-slideup"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-[#d8cbb4] mx-auto mb-4" />
            <div className="text-xs text-[#8a7d6b] mb-3">{openEntry.day}</div>
            <EntryDetail entry={openEntry} />
          </div>
        </div>
      )}
    </div>
  )
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)) }

function calcStreak(entries: { day: string }[]): number {
  const days = new Set(entries.map((e) => e.day))
  let streak = 0
  const d = new Date()
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

function fmtDate(d: Date) {
  return `${d.getMonth() + 1}月${d.getDate()}日 · 星期${'日一二三四五六'[d.getDay()]}`
}

async function grabPoster(videoURL: string): Promise<string> {
  return new Promise((res, rej) => {
    const v = document.createElement('video')
    v.muted = true; v.playsInline = true; v.src = videoURL
    v.onloadeddata = () => { v.currentTime = 0.1 }
    v.onseeked = () => {
      const cv = document.createElement('canvas')
      cv.width = v.videoWidth || 640; cv.height = v.videoHeight || 480
      cv.getContext('2d')!.drawImage(v, 0, 0)
      res(cv.toDataURL('image/jpeg', 0.85))
    }
    v.onerror = rej
  })
}

function urlToImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = url
  })
}
