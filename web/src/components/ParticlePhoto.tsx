import { useEffect, useRef } from 'react'

// 照片粒子化:采样像素 → 粒子场;hover 处以高斯衰减「压陷」粒子
interface Pt {
  ox: number; oy: number // 原始位置
  x: number; y: number    // 当前位置
  sx: number; sy: number  // 散落起点
  r: number; g: number; b: number
  size: number
  thresh: number          // 出现阈值 (0-1)
  phase: number           // 呼吸相位
  depth: number           // 当前凹陷量 0-1
}

// Box-Muller 高斯随机
function gauss(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function ParticlePhoto({ src, className }: { src: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const wrap = wrapRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let pts: Pt[] = []
    let W = 0, H = 0
    const mouse = { x: -9999, y: -9999, active: false }
    let progress = 0 // 0=散落 1=聚合
    const start = performance.now()
    let dead = false

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    const build = () => {
      const rect = wrap.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      W = rect.width; H = rect.width * (img.height / img.width)
      const maxH = window.innerHeight * 0.52
      if (H > maxH) { H = maxH; W = H * (img.width / img.height) }
      canvas.width = W * dpr; canvas.height = H * dpr
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
      ctx.scale(dpr, dpr)

      // 降采样取色
      const cols = Math.max(64, Math.floor(W / 5))
      const rows = Math.floor(cols * (H / W))
      const off = document.createElement('canvas')
      off.width = cols; off.height = rows
      const octx = off.getContext('2d')!
      octx.drawImage(img, 0, 0, cols, rows)
      const data = octx.getImageData(0, 0, cols, rows).data

      pts = []
      const cw = W / cols, ch = H / rows
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4
          pts.push({
            ox: x * cw + cw / 2,
            oy: y * ch + ch / 2,
            x: 0, y: 0,
            sx: x * cw + gauss() * W * 0.35,
            sy: y * ch + gauss() * H * 0.35,
            r: data[i], g: data[i + 1], b: data[i + 2],
            size: Math.min(cw, ch) * 0.52,
            thresh: Math.random(),
            phase: Math.random() * Math.PI * 2,
            depth: 0,
          })
        }
      }
    }

    const RADIUS = 90

    const frame = (now: number) => {
      if (dead) return
      // 聚合进度:线性插值步进逼近
      const target = 1
      progress += (target - progress) * 0.08
      const t = (now - start) / 1000

      ctx.clearRect(0, 0, W, H)
      for (const p of pts) {
        // 可见性:阈值低于进度才出现 → 随机顺序聚合
        if (p.thresh > progress + 0.02) continue
        const appear = Math.min(1, Math.max(0, (progress - p.thresh) * 6))

        // hover 凹陷:高斯衰减
        const dx = p.ox - mouse.x, dy = p.oy - mouse.y
        const d2 = dx * dx + dy * dy
        const influence = mouse.active ? Math.exp(-d2 / (2 * RADIUS * RADIUS * 0.36)) : 0
        p.depth += (influence - p.depth) * 0.18

        // 位置:散落→原点,呼吸漂移,凹陷处被「按」向四周
        const drift = Math.sin(t * 1.2 + p.phase) * 0.8
        const push = p.depth * 14
        const len = Math.sqrt(d2) || 1
        const tx = p.ox + (mouse.active ? (dx / len) * push : 0)
        const ty = p.oy + (mouse.active ? (dy / len) * push : 0) + drift

        p.x = p.sx + (tx - p.sx) * appear
        p.y = p.sy + (ty - p.sy) * appear

        // 凹陷:缩小 + 压暗,模拟按进布料的阴影
        const dark = 1 - p.depth * 0.55
        const sz = p.size * (0.4 + 0.6 * appear) * (1 - p.depth * 0.45)
        ctx.fillStyle = `rgb(${(p.r * dark) | 0},${(p.g * dark) | 0},${(p.b * dark) | 0})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0.4, sz), 0, 7)
        ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }

    img.onload = () => {
      build()
      raf = requestAnimationFrame(frame)
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
    }
    const onLeave = () => { mouse.active = false }
    const onResize = () => { if (img.complete && img.width) build() }

    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerdown', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onResize)
    return () => {
      dead = true
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerdown', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [src])

  return (
    <div ref={wrapRef} className={`flex justify-center ${className ?? ''}`}>
      <canvas ref={canvasRef} style={{ imageRendering: 'crisp-edges', borderRadius: 14, touchAction: 'none' }} />
    </div>
  )
}
