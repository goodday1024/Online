import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/store/AppContext'
import type { PhotoEntry } from '@/types'
import { UIIcon, UI } from '@/lib/icons'

// 留声机:给照片录一段声音;播放时黑胶转动、唱针落下
export function Phonograph({ entry }: { entry: PhotoEntry }) {
  const { dispatch } = useApp()
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [playing, setPlaying] = useState(false)
  const recRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => {
    timerRef.current && clearInterval(timerRef.current)
    audioRef.current?.pause()
  }, [])

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      const chunks: Blob[] = []
      rec.ondataavailable = (e) => chunks.push(e.data)
      rec.onstop = () => {
        const url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType }))
        stream.getTracks().forEach((t) => t.stop())
        dispatch({ type: 'update', id: entry.id, patch: { voice: url, voiceName: `声音 · ${seconds}s` } })
        setSeconds(0)
      }
      recRef.current = rec
      rec.start()
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      // 无麦克风:附一段模拟「环境音」标记
      dispatch({ type: 'update', id: entry.id, patch: { voiceName: '那天的环境音(模拟)' } })
    }
  }

  const stopRec = () => {
    timerRef.current && clearInterval(timerRef.current)
    setRecording(false)
    recRef.current?.stop()
  }

  const togglePlay = () => {
    if (!entry.voice) return
    if (!audioRef.current) {
      audioRef.current = new Audio(entry.voice)
      audioRef.current.onended = () => setPlaying(false)
    }
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#e0d5c2] bg-[#f4f0ea] p-4">
      {/* 黑胶 */}
      <div className="relative shrink-0">
        <div className={`vinyl ${playing ? 'vinyl-spin' : ''}`}>
          <div className="vinyl-label" style={{ backgroundImage: `url(${entry.photo})` }} />
        </div>
        <div className={`tonearm ${playing ? 'tonearm-on' : ''}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs tracking-[0.25em] text-[#8a7d6b] mb-1">留声机</div>
        {entry.voice || entry.voiceName ? (
          <>
            <div className="text-sm text-[#4f483e] font-medium truncate">{entry.voiceName ?? '一段声音'}</div>
            <div className="text-xs text-[#8a7d6b] mt-0.5">声音已与这张照片归档在一起</div>
            {entry.voice && (
              <button onClick={togglePlay}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#4f483e] text-[#f4f0ea] active:scale-95 transition">
                <UIIcon d={playing ? UI.pause : UI.play} size={12} />
                {playing ? '暂停' : '播放'}
              </button>
            )}
          </>
        ) : (
          <>
            <div className="text-sm text-[#4f483e] font-medium">{recording ? `录音中 ${seconds}s…` : '给这张照片配一段声音'}</div>
            <div className="text-xs text-[#8a7d6b] mt-0.5">当时的歌、风声,或想说的话</div>
            <button onClick={recording ? stopRec : startRec}
              className={`mt-2.5 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full active:scale-95 transition ${
                recording ? 'bg-[#f54001] text-white voice-pulse' : 'bg-[#4f483e] text-[#f4f0ea]'
              }`}>
              <UIIcon d={UI.mic} size={12} />
              {recording ? '停止并保存' : '开始录音'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
