import type { CategoryId, PhotoEntry } from '@/types'

// 用 canvas 绘制「画出来的」示例照片:渐变天空 + 太阳/月亮 + 地平线与噪点
function paintScene(w: number, h: number, stops: string[], sun: { x: number; y: number; r: number; c: string } | null, bands: string[]): string {
  const cv = document.createElement('canvas')
  cv.width = w; cv.height = h
  const x = cv.getContext('2d')!
  const g = x.createLinearGradient(0, 0, 0, h)
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c))
  x.fillStyle = g
  x.fillRect(0, 0, w, h)
  if (sun) {
    const rg = x.createRadialGradient(sun.x * w, sun.y * h, 0, sun.x * w, sun.y * h, sun.r * w)
    rg.addColorStop(0, sun.c)
    rg.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = rg
    x.beginPath(); x.arc(sun.x * w, sun.y * h, sun.r * w, 0, 7); x.fill()
  }
  bands.forEach((c, i) => {
    x.fillStyle = c
    const y0 = h * (0.62 + i * 0.14)
    x.beginPath()
    x.moveTo(0, y0)
    for (let px = 0; px <= w; px += 8) {
      x.lineTo(px, y0 + Math.sin(px / 60 + i * 3) * 14 - i * 6)
    }
    x.lineTo(w, h); x.lineTo(0, h); x.fill()
  })
  // 噪点颗粒
  const img = x.getImageData(0, 0, w, h)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n
  }
  x.putImageData(img, 0, 0)
  return cv.toDataURL('image/jpeg', 0.85)
}

const dayStr = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() - offset)
  return d.toISOString().slice(0, 10)
}

interface Seed { off: number; cat: CategoryId; diary: string; title: string; sui?: string }

const SEEDS: Seed[] = [
  { off: 0, cat: 'nature', title: '万物观察日记', diary: '楼下的桂花开了第二波,香气比第一波更沉。蹲下来拍的时候,一只猫从镜头前踱过去,一点都不急。自然从不着急,却什么都完成了。记录于此,未来的我请查收。' },
  { off: 0, cat: 'food', title: '胃里的小太阳', diary: '加班到八点,一碗热汤面把自己救了回来。汤头是那种熬了很久的鲜,第一口下去眼睛就眯起来了。食物是最诚实的慰藉。明天也要继续认真生活。' },
  { off: 1, cat: 'sport', title: '流汗的形状', diary: '夜跑五公里,最后一公里腿在抗议,但冲过路口那刻什么都值了。汗水顺着下巴滴下来的时候,忽然觉得自己又强大了一点。生活这款游戏,今天的体力条用得其所。' },
  { off: 2, cat: 'reading', title: '纸页之间', diary: '重读一本旧书,读到某一页突然停下来,盯着天花板发了很久的呆。书里那句话像专门等着我今天来读。晚安,今天辛苦了。' },
  { off: 3, cat: 'travel', title: '在别处', diary: '临时起意去了邻市。车窗外的风景一帧一帧往后退,心一点一点往前走。在陌生的街道迷路,却遇见了最好看的天空。', sui: '说起来有点零碎——车票根还揣在兜里。然后呢,那家小店的面一般,但老板娘笑得很好看。对了,回程时睡了全程,梦都是蓝色的。说完就舒服了,晚安。' },
  { off: 5, cat: 'social', title: '笑声存档', diary: '老朋友聚会,笑到肚子疼,回家路上还在回味那个梗。有些见面像充电,今天满格了。愿日子常新,未来不远。' },
  { off: 6, cat: 'focus', title: '深潜时刻', diary: '关掉所有通知写方案,进入心流的时候,三个小时像三分钟。抬头看表,有一种潜水后浮出水面的恍惚。' },
  { off: 8, cat: 'create', title: '灵感落地日', diary: '捏了一个歪歪扭扭的陶杯,但它是我的。创作的快乐在于:世界上多了一件本来不存在的东西。' },
  { off: 9, cat: 'outdoor', title: '山野来信', diary: '走了条没走过的步道,鞋子上沾了泥,裤脚蹭了草籽,这些都是今天的勋章。风从山谷里吹上来,把一周的疲惫都带走了。' },
  { off: 12, cat: 'milestone', title: '值得记住的一天', diary: '项目终于上线了。站在节点上回头看,原来已经走了这么远。这一天值得被记住——我把它郑重地存进了相册。' },
  { off: 14, cat: 'life', title: '平凡一日', diary: '把房间收拾干净,心情也跟着亮了。普普通通的一天,但晚霞免费。生活的可爱,藏在那些没被计划的缝隙里。' },
  { off: 17, cat: 'kindness', title: '温柔的证据', diary: '帮楼下的奶奶把快递搬上五楼,收到一句谢谢,开心了一整个下午。善意是会回弹的,今天收到了回声。' },
]

const PALETTES: Record<CategoryId, [string[], { x: number; y: number; r: number; c: string } | null, string[]]> = {
  nature: [['#a8c686', '#5d8a5a', '#2e4d33'], { x: 0.7, y: 0.25, r: 0.25, c: 'rgba(255,244,200,0.9)' }, ['#3c5f40', '#2a4630', '#1d3322']],
  food: [['#f0b25f', '#c97b2d', '#7a4218'], { x: 0.5, y: 0.3, r: 0.3, c: 'rgba(255,220,150,0.95)' }, ['#8a4d1e', '#6b3a15', '#4d290e']],
  sport: [['#ff9a5c', '#f54001', '#8c2400'], { x: 0.3, y: 0.28, r: 0.28, c: 'rgba(255,240,200,0.9)' }, ['#a32e00', '#7a2100', '#571700']],
  reading: [['#d8cfae', '#9d9478', '#5f5844'], { x: 0.65, y: 0.3, r: 0.22, c: 'rgba(255,250,220,0.85)' }, ['#6e6650', '#544e3c', '#3d382b']],
  travel: [['#a5d8e8', '#3f7ea6', '#1d4060'], { x: 0.5, y: 0.22, r: 0.3, c: 'rgba(255,255,240,0.9)' }, ['#2c5a7a', '#1f4258', '#142c3c']],
  social: [['#f2a7b3', '#c4556b', '#6e2436'], { x: 0.4, y: 0.3, r: 0.26, c: 'rgba(255,230,220,0.9)' }, ['#8c3247', '#66242f', '#451822']],
  focus: [['#9b8fb8', '#6b5b8c', '#352c4d'], { x: 0.7, y: 0.3, r: 0.2, c: 'rgba(230,220,255,0.85)' }, ['#4d4168', '#372e4d', '#251f36']],
  create: [['#e0a8d4', '#a25fa2', '#542b57'], { x: 0.35, y: 0.25, r: 0.26, c: 'rgba(255,230,250,0.9)' }, ['#6e3a6e', '#502a52', '#381c3a']],
  outdoor: [['#c9d98f', '#7a8c3f', '#3d4a1e'], { x: 0.6, y: 0.22, r: 0.28, c: 'rgba(255,250,200,0.9)' }, ['#55632c', '#3d4a1f', '#2a3415']],
  life: [['#e8ddc8', '#b0a284', '#6e6350'], { x: 0.5, y: 0.28, r: 0.24, c: 'rgba(255,250,230,0.85)' }, ['#7d7159', '#5d5340', '#423a2c']],
  kindness: [['#f5d98f', '#c49a3f', '#6e5418'], { x: 0.5, y: 0.3, r: 0.28, c: 'rgba(255,245,200,0.95)' }, ['#8a6824', '#644a18', '#443210']],
  milestone: [['#8f949e', '#4a4e57', '#1f2228'], { x: 0.5, y: 0.2, r: 0.22, c: 'rgba(240,244,255,0.8)' }, ['#33373f', '#24272d', '#16181c']],
}

export function seedEntries(): PhotoEntry[] {
  return SEEDS.map((s, i) => {
    const [stops, sun, bands] = PALETTES[s.cat]
    const portrait = i % 3 === 0
    return {
      id: `seed-${i}`,
      day: dayStr(s.off),
      createdAt: Date.now() - s.off * 86400000 - i * 3600000,
      photo: paintScene(portrait ? 480 : 640, portrait ? 640 : 480, stops, sun, bands),
      category: s.cat,
      hue: 0,
      diary: s.diary,
      diaryTitle: s.title,
      suishuinian: s.sui,
      mood: 3 + (i % 3),
    }
  })
}

export function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = url
  })
}

export function imageToDataURL(img: HTMLImageElement, max = 960): string {
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const cv = document.createElement('canvas')
  cv.width = img.width * scale
  cv.height = img.height * scale
  cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height)
  return cv.toDataURL('image/jpeg', 0.85)
}
