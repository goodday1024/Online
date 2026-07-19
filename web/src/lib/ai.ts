import type { CategoryId } from '@/types'

// ---- 端侧「视觉理解」:对照片做像素采样,提取主色调/亮度/饱和度,映射到成就类别 ----
export interface VisionResult {
  category: CategoryId
  hue: number
  confidence: number
  sceneWords: string[]
}

export function analyzeImage(img: HTMLImageElement): VisionResult {
  const c = document.createElement('canvas')
  const s = 48
  c.width = s; c.height = s
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0, s, s)
  const d = ctx.getImageData(0, 0, s, s).data
  let r = 0, g = 0, b = 0
  const n = s * s
  for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2] }
  r /= n; g /= n; b /= n
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 510
  const sat = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255))
  let h = 0
  if (max !== min) {
    if (max === r) h = 60 * (((g - b) / (max - min)) % 6)
    else if (max === g) h = 60 * ((b - r) / (max - min) + 2)
    else h = 60 * ((r - g) / (max - min) + 4)
  }
  if (h < 0) h += 360

  let category: CategoryId
  let sceneWords: string[]
  if (sat < 0.12 && l > 0.75) { category = 'life'; sceneWords = ['云', '白墙', '安静的光'] }
  else if (sat < 0.12) { category = 'focus'; sceneWords = ['夜色', '桌面', '台灯'] }
  else if (h < 18 || h >= 340) { category = pick(['food', 'social', 'milestone']); sceneWords = ['暖光', '笑容', '庆祝'] }
  else if (h < 45) { category = pick(['food', 'life', 'create']); sceneWords = ['餐桌', '黄昏', '手作'] }
  else if (h < 75) { category = pick(['food', 'nature', 'sport']); sceneWords = ['落叶', '阳光', '能量'] }
  else if (h < 165) { category = pick(['nature', 'outdoor', 'sport']); sceneWords = ['树叶', '草地', '风'] }
  else if (h < 200) { category = pick(['nature', 'travel', 'reading']); sceneWords = ['湖水', '清晨', '旅途'] }
  else if (h < 255) { category = pick(['travel', 'outdoor', 'reading']); sceneWords = ['天空', '海', '远方'] }
  else if (h < 290) { category = pick(['create', 'focus', 'reading']); sceneWords = ['紫藤', '灵感', '深夜'] }
  else { category = pick(['social', 'create', 'kindness']); sceneWords = ['花', '聚会', '礼物'] }

  const confidence = Math.min(0.97, 0.72 + sat * 0.25 + Math.random() * 0.05)
  return { category, hue: Math.round(h), confidence, sceneWords }
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

// ---- 端侧「日记生成」----
const OPENERS = [
  '今天的天空像被谁轻轻擦过,', '闹钟响第三遍的时候我终于起来了,', '出门时风刚刚好,',
  '这一天过得比想象中慢,', '如果今天有颜色,那大概是温柔的,', '没什么宏大的事发生,但',
  '今天的节奏出乎意料地舒服,', '午后的光斜斜地照进来,',
]
const SCENE: Record<string, string[]> = {
  sport: ['汗水顺着下巴滴下来的时候,忽然觉得自己又强大了一点', '最后一公里腿在抗议,但冲线那刻什么都值了', '运动完坐在路边喘气,看人来人往,心里很满'],
  outdoor: ['鞋子上沾了泥,裤脚蹭了草籽,这些都是今天的勋章', '走到高处回头一看,城市小得像积木', '风从山谷里吹上来,把一周的疲惫都带走了'],
  food: ['第一口下去眼睛就眯起来了,好吃到想给厨师鞠躬', '热气腾腾的那一锅,把今天所有的委屈都熨平了', '食物是最诚实的慰藉,今天被好好喂饱了'],
  reading: ['读到某一页突然停下来,盯着天花板发了很久的呆', '书里那句话像专门等着我今天来读', '在别人的故事里,认领了自己的心事'],
  create: ['做出来的东西歪歪扭扭,但它是我的', '灵感来的时候手忙脚乱地记,生怕它跑掉', '创作的快乐在于:世界上多了一件本来不存在的东西'],
  social: ['笑到肚子疼,回家路上还在回味那个梗', '和喜欢的人待在一起,时间总是不够用', '有些见面像充电,今天满格了'],
  travel: ['车窗外的风景一帧一帧往后退,心一点一点往前走', '在陌生的街道迷路,却遇见了最好看的天空', '远方的意义,大概就是让日常重新变得新鲜'],
  nature: ['蹲下来看一朵花看了十分钟,它值得', '云在变,光在变,我站在那里舍不得走', '自然从不着急,却什么都完成了'],
  focus: ['关掉所有通知的那几个小时,世界安静得只剩我和这件事', '进入心流的时候,三个小时像三分钟', '专注结束抬头看表,有一种潜水后浮出水面的恍惚'],
  life: ['把房间收拾干净,心情也跟着亮了', '普普通通的一天,但晚霞免费', '生活的可爱,藏在那些没被计划的缝隙里'],
  kindness: ['帮到别人的那一瞬间,自己心里先暖了一下', '收到一句谢谢,开心了一整个下午', '善意是会回弹的,今天收到了回声'],
  milestone: ['站在节点上回头看,原来已经走了这么远', '这一天值得被记住——我把它郑重地存进了相册', '小小的里程碑,大大的自己'],
}
const CLOSERS = [
  '明天也要继续认真生活。', '这样的一天,想存进记忆的银行。', '晚安,今天辛苦了。',
  '愿日子常新,未来不远。', '记录于此,未来的我请查收。', '生活这款游戏,今天的体验卡用得很值。',
]

export function generateDiary(cat: CategoryId, scene: string[]): { title: string; text: string } {
  const titles: Record<string, string[]> = {
    sport: ['流汗的形状', '身体的回信'], outdoor: ['去风里走了走', '山野来信'],
    food: ['今日份满足', '胃里的小太阳'], reading: ['纸页之间', '与书独处的下午'],
    create: ['造点什么', '灵感落地日'], social: ['人间值得', '笑声存档'],
    travel: ['在别处', '移动的风景'], nature: ['万物观察日记', '自然的功课'],
    focus: ['深潜时刻', '安静的力量'], life: ['平凡一日', '生活切片 No.' + Math.floor(Math.random() * 99)],
    kindness: ['微光日志', '温柔的证据'], milestone: ['里程碑达成', '值得记住的一天'],
  }
  const text = [
    pick(OPENERS),
    pick(SCENE[cat]),
    scene.length ? `画面里有${scene.slice(0, 2).join('和')},细节都还热乎着。` : '',
    pick(CLOSERS),
  ].filter(Boolean).join('')
  return { title: pick(titles[cat]), text }
}

// ---- 实时语音对话(端侧模拟)----
const AI_TURNS = [
  '嗯,我在听。看到这张照片,第一感觉是什么?',
  '那个瞬间,空气里是什么味道/什么声音?',
  '如果给这张照片起一个只有你们懂的名字,会叫什么?',
  '当时的你和现在的你,想对彼此说什么?',
  '还有什么是照片没拍下来、但你不想忘的?',
  '最后一个问题:今天最想感谢的一个瞬间是?',
]
export const aiTurn = (i: number) => AI_TURNS[Math.min(i, AI_TURNS.length - 1)]

const AI_REPLIES = [
  (t: string) => `「${clip(t)}」——这个细节很好,我记下来了。`,
  (t: string) => `原来如此,${clip(t)}。这比照片本身更有意思。`,
  () => `听出来了,那一刻对你挺重要的。`,
  () => `嗯,这种感觉很难得。再多说一点?`,
]
export const aiReply = (input: string) => pick(AI_REPLIES)(input)
const clip = (t: string) => (t.length > 14 ? t.slice(0, 14) + '…' : t)

// ---- 生成碎碎念:把对话织成一篇意识流短文 ----
export function generateSuishuinian(chat: { role: 'me' | 'ai'; text: string }[]): string {
  const mine = chat.filter((c) => c.role === 'me').map((c) => c.text.replace(/[。!?\s]+$/, ''))
  const heads = ['说起来有点零碎——', '睡前把今天抖一抖,掉出来这些:', '一些没头没尾的话:', '脑子里的弹幕,随手接住几条:']
  const glue = ['然后呢,', '还有,', '对了,', '说起来,', '哦还有——']
  const tails = ['……就这些吧,碎碎的东西,碎碎地放着,也挺好。', '。没什么逻辑,但都是真的。', '。说完就舒服了,晚安。']
  const body = mine.map((m, i) => (i === 0 ? m : pick(glue) + m)).join('。')
  return `${pick(heads)}${body}${pick(tails)}`
}
