import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/store/AppContext'
import { ParticlePhoto } from './ParticlePhoto'
import { UIIcon, UI } from '@/lib/icons'
import { aiReply, aiTurn, generateSuishuinian } from '@/lib/ai'

interface Msg { role: 'me' | 'ai'; text: string }

export function SuishuinianMode() {
  const { state, dispatch } = useApp()
  const entry = state.entries.find((e) => e.id === state.suishuinianFor)
  const [chat, setChat] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const [aiTyping, setAiTyping] = useState(false)
  const [result, setResult] = useState<string | null>(entry?.suishuinian ?? null)
  const [streaming, setStreaming] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const recogRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    if (!entry) return
    const t = setTimeout(() => setChat([{ role: 'ai', text: aiTurn(0) }]), 900)
    return () => clearTimeout(t)
  }, [entry?.id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' })
  }, [chat, aiTyping, result])

  if (!entry) return null

  const meCount = chat.filter((c) => c.role === 'me').length

  const pushUser = (text: string) => {
    if (!text.trim()) return
    const next = [...chat, { role: 'me' as const, text: text.trim() }]
    setChat(next)
    setInput('')
    setAiTyping(true)
    setTimeout(() => {
      setAiTyping(false)
      const reply = next.filter((c) => c.role === 'me').length >= 4
        ? '好啦,材料够了。点下面「生成碎碎念」,我把它们织起来。'
        : `${aiReply(text)} ${aiTurn(next.filter((c) => c.role === 'me').length)}`
      setChat([...next, { role: 'ai', text: reply }])
    }, 1100)
  }

  const startVoice = () => {
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => {
      lang: string; continuous: boolean; interimResults: boolean
      onresult: (e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void
      onend: () => void; start: () => void; stop: () => void
    } }).webkitSpeechRecognition
    if (!SR) {
      // 无语音识别环境:模拟拾音
      setListening(true)
      setTimeout(() => { setListening(false); setInput('那一刻突然觉得,一切都刚刚好') }, 2200)
      return
    }
    const r = new SR()
    r.lang = 'zh-CN'; r.continuous = false; r.interimResults = false
    r.onresult = (e) => setInput(e.results[0][0].transcript)
    r.onend = () => setListening(false)
    recogRef.current = r
    setListening(true)
    r.start()
  }

  const stopVoice = () => { recogRef.current?.stop(); setListening(false) }

  const generate = () => {
    const full = generateSuishuinian(chat)
    setResult('')
    // 流式打出
    let i = 0
    const timer = setInterval(() => {
      i += 2
      setStreaming(full.slice(0, i))
      if (i >= full.length) {
        clearInterval(timer)
        setResult(full)
        dispatch({ type: 'update', id: entry.id, patch: { suishuinian: full, chat } })
      }
    }, 30)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-[#1c1813]/97 backdrop-blur-sm animate-fadein">
      <div className="w-full max-w-[430px] h-full flex flex-col px-5 pt-4 pb-6 overflow-hidden">
        {/* 顶栏 */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div>
            <div className="text-[#ece4d9] text-lg font-semibold tracking-wide">碎碎念模式</div>
            <div className="text-[#8a7d6b] text-xs mt-0.5">照片已化为粒子 · 摸一摸它,再聊聊</div>
          </div>
          <button onClick={() => dispatch({ type: 'openSui', id: null })}
            className="w-9 h-9 rounded-full border border-[#4f483e] text-[#ece4d9] flex items-center justify-center active:scale-90 transition">
            <UIIcon d={UI.close} size={16} />
          </button>
        </div>

        {/* 粒子照片 */}
        <div className="shrink-0 rounded-2xl overflow-hidden">
          <ParticlePhoto src={entry.photo} />
        </div>

        {/* 对话区 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto mt-4 space-y-2.5 pr-1 no-scrollbar">
          {chat.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'me' ? 'justify-end' : 'justify-start'} animate-fadein`}>
              <div className={`max-w-[82%] px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl ${
                m.role === 'me'
                  ? 'bg-[#f54001] text-white rounded-br-md'
                  : 'bg-[#2b251d] text-[#e8ddc8] rounded-bl-md border border-[#3d352a]'
              }`}>{m.text}</div>
            </div>
          ))}
          {aiTyping && (
            <div className="flex justify-start">
              <div className="bg-[#2b251d] border border-[#3d352a] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                {[0, 1, 2].map((i) => <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.18}s` }} />)}
              </div>
            </div>
          )}
          {(result !== null || streaming) && (
            <div className="animate-fadein rounded-2xl border border-[#4f483e] bg-[#241f18] p-4">
              <div className="text-[#c49a3f] text-xs tracking-[0.3em] mb-2">今日碎碎念</div>
              <p className="text-[#ece4d9] text-sm leading-7 font-serif-sc whitespace-pre-wrap">
                {result ?? streaming}<span className="animate-pulse">{result === null ? '▍' : ''}</span>
              </p>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="shrink-0 mt-3">
          {meCount >= 2 && result === null && !streaming && (
            <button onClick={generate}
              className="w-full mb-2.5 py-3 rounded-full bg-[#c49a3f] text-[#1c1813] font-semibold text-sm active:scale-[0.98] transition flex items-center justify-center gap-2">
              <UIIcon d={UI.spark} size={16} /> 生成碎碎念
            </button>
          )}
          <div className="flex items-center gap-2">
            <button
              onPointerDown={startVoice} onPointerUp={stopVoice}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition active:scale-90 ${
                listening ? 'bg-[#f54001] text-white voice-pulse' : 'bg-[#2b251d] text-[#ece4d9] border border-[#3d352a]'
              }`}>
              <UIIcon d={UI.mic} size={20} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && pushUser(input)}
              placeholder={listening ? '正在聆听…' : '说点什么,或者按住话筒说话'}
              className="flex-1 h-12 px-4 rounded-full bg-[#2b251d] border border-[#3d352a] text-[#ece4d9] text-sm placeholder:text-[#6e6350] outline-none focus:border-[#f54001]"
            />
            <button onClick={() => pushUser(input)}
              className="w-12 h-12 rounded-full bg-[#ece4d9] text-[#1c1813] flex items-center justify-center active:scale-90 transition">
              <UIIcon d={UI.send} size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
