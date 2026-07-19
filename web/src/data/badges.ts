import type { BadgeDef, Category, CategoryId } from '@/types'

export const CATEGORIES: Category[] = [
  { id: 'sport',     name: '运动',   en: 'Move',      color: '#f54001' },
  { id: 'outdoor',   name: '户外',   en: 'Outdoor',   color: '#7a8c3f' },
  { id: 'food',      name: '美食',   en: 'Taste',     color: '#c97b2d' },
  { id: 'reading',   name: '阅读',   en: 'Read',      color: '#5b7a99' },
  { id: 'create',    name: '创作',   en: 'Create',    color: '#a25fa2' },
  { id: 'social',    name: '相聚',   en: 'Together',  color: '#c4556b' },
  { id: 'travel',    name: '远行',   en: 'Journey',   color: '#3f7ea6' },
  { id: 'nature',    name: '自然',   en: 'Nature',    color: '#4e8a5a' },
  { id: 'focus',     name: '专注',   en: 'Focus',     color: '#6b5b8c' },
  { id: 'life',      name: '日常',   en: 'Daily',     color: '#8a7d6b' },
  { id: 'kindness',  name: '善意',   en: 'Kindness',  color: '#c49a3f' },
  { id: 'milestone', name: '里程碑', en: 'Milestone', color: '#2f2a24' },
]

export const categoryById = (id: CategoryId): Category =>
  CATEGORIES.find((c) => c.id === id)!

// 每个类别 9 枚勋章:铜(I-III) 银(IV-V) 金(VI-VII) 玫瑰金(VIII) 曜石(IX)
const NAMES: Record<CategoryId, [string, string][]> = {
  sport: [
    ['初试锋芒', '完成第一次运动记录'], ['汗水之证', '累计 3 次运动'], ['律动之心', '累计 7 次运动'],
    ['破风者', '累计 14 次运动'], ['不屈之躯', '累计 21 次运动'], ['钢铁意志', '累计 30 次运动'],
    ['超越极限', '累计 50 次运动'], ['燃烬之星', '累计 75 次运动'], ['永恒动量', '累计 100 次运动'],
  ],
  outdoor: [
    ['迈出房门', '第一次户外探索'], ['微风旅人', '累计 3 次户外'], ['山野知音', '累计 7 次户外'],
    ['溪谷行者', '累计 14 次户外'], ['林径向导', '累计 21 次户外'], ['峰峦征服者', '累计 30 次户外'],
    ['荒野诗人', '累计 50 次户外'], ['地平线图鉴', '累计 75 次户外'], ['大地漫游者', '累计 100 次户外'],
  ],
  food: [
    ['舌尖初醒', '第一次记录美食'], ['烟火人间', '累计 3 次美食'], ['风味猎人', '累计 7 次美食'],
    ['深夜食堂', '累计 14 次美食'], ['百味杂陈', '累计 21 次美食'], ['米其林之心', '累计 30 次美食'],
    ['味觉炼金师', '累计 50 次美食'], ['珍馐图鉴', '累计 75 次美食'], ['人间至味', '累计 100 次美食'],
  ],
  reading: [
    ['翻开第一页', '第一次阅读记录'], ['枕边书声', '累计 3 次阅读'], ['字句拾荒者', '累计 7 次阅读'],
    ['纸页旅人', '累计 14 次阅读'], ['书房守望者', '累计 21 次阅读'], ['思想潜泳员', '累计 30 次阅读'],
    ['万卷行者', '累计 50 次阅读'], ['黄金屋主', '累计 75 次阅读'], ['文明藏书阁', '累计 100 次阅读'],
  ],
  create: [
    ['灵感火花', '第一次创作记录'], ['手作温度', '累计 3 次创作'], ['造梦学徒', '累计 7 次创作'],
    ['想象工程师', '累计 14 次创作'], ['美学捕手', '累计 21 次创作'], ['造物者之眼', '累计 30 次创作'],
    ['灵感永动机', '累计 50 次创作'], ['宇宙设计师', '累计 75 次创作'], ['创世之手', '累计 100 次创作'],
  ],
  social: [
    ['你好世界', '第一次相聚记录'], ['碰杯时刻', '累计 3 次相聚'], ['欢声笑语', '累计 7 次相聚'],
    ['灯火可亲', '累计 14 次相聚'], ['知己二三', '累计 21 次相聚'], ['人间联结', '累计 30 次相聚'],
    ['温暖磁场', '累计 50 次相聚'], ['星河会客厅', '累计 75 次相聚'], ['万有引力', '累计 100 次相聚'],
  ],
  travel: [
    ['行囊初启', '第一次远行记录'], ['下一站', '累计 3 次远行'], ['地图边角', '累计 7 次远行'],
    ['季风信使', '累计 14 次远行'], ['时区收藏家', '累计 21 次远行'], ['经纬度诗人', '累计 30 次远行'],
    ['候鸟航线', '累计 50 次远行'], ['七大洲邮戳', '累计 75 次远行'], ['地球online满级玩家', '累计 100 次远行'],
  ],
  nature: [
    ['一叶知秋', '第一次自然记录'], ['苔痕上阶', '累计 3 次自然'], ['听风观云', '累计 7 次自然'],
    ['林间低语', '累计 14 次自然'], ['四季标本', '累计 21 次自然'], ['万物有灵', '累计 30 次自然'],
    ['生态记录仪', '累计 50 次自然'], ['盖亚之友', '累计 75 次自然'], ['自然编年史', '累计 100 次自然'],
  ],
  focus: [
    ['心无旁骛', '第一次专注记录'], ['入定时刻', '累计 3 次专注'], ['心流初体验', '累计 7 次专注'],
    ['深度潜水员', '累计 14 次专注'], ['时间雕刻家', '累计 21 次专注'], ['意念如针', '累计 30 次专注'],
    ['禅与钻研', '累计 50 次专注'], ['绝对领域', '累计 75 次专注'], ['心流大师', '累计 100 次专注'],
  ],
  life: [
    ['生活切片', '第一次日常记录'], ['小确幸', '累计 3 次日常'], ['日常收藏家', '累计 7 次日常'],
    ['平淡即真', '累计 14 次日常'], ['生活美学家', '累计 21 次日常'], ['岁月纹理', '累计 30 次日常'],
    ['光阴编织者', '累计 50 次日常'], ['人间观察员', '累计 75 次日常'], ['生活史诗', '累计 100 次日常'],
  ],
  kindness: [
    ['微光', '第一次善意记录'], ['举手之劳', '累计 3 次善意'], ['温柔回响', '累计 7 次善意'],
    ['暖流传导体', '累计 14 次善意'], ['点灯人', '累计 21 次善意'], ['春风化雨', '累计 30 次善意'],
    ['善意涟漪', '累计 50 次善意'], ['人间天使', '累计 75 次善意'], ['光之使者', '累计 100 次善意'],
  ],
  milestone: [
    ['启程', '第一次记录里程碑'], ['第一步', '累计 3 次里程碑'], ['破晓', '累计 7 次里程碑'],
    ['拐点', '累计 14 次里程碑'], ['登峰', '累计 21 次里程碑'], ['造极', '累计 30 次里程碑'],
    ['传奇书写者', '累计 50 次里程碑'], ['时代注脚', '累计 75 次里程碑'], ['不朽刻度', '累计 100 次里程碑'],
  ],
}

const TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']

export const BADGES: BadgeDef[] = (Object.keys(NAMES) as CategoryId[]).flatMap((cat) =>
  NAMES[cat].map(([name, desc], i) => ({
    id: `${cat}-${i + 1}`,
    category: cat,
    tier: TIERS[i],
    name: `${name} · ${ROMAN[i]}`,
    desc,
  })),
)

export type MetalKind = 'bronze' | 'silver' | 'gold' | 'rose' | 'obsidian'

export const metalOf = (tier: number): MetalKind =>
  tier <= 3 ? 'bronze' : tier <= 5 ? 'silver' : tier <= 7 ? 'gold' : tier === 8 ? 'rose' : 'obsidian'

export const METALS: Record<MetalKind, { ring: string; face: string; edge: string; label: string }> = {
  bronze: {
    label: '青铜',
    ring: 'conic-gradient(from 210deg, #8c5a2b, #d9a05b 12%, #6e441f 25%, #e8b878 40%, #7c4f24 55%, #d9a05b 70%, #5f3a1a 85%, #8c5a2b)',
    face: 'radial-gradient(circle at 32% 28%, #e3b071, #a6713a 55%, #6e441f)',
    edge: '#4d2f13',
  },
  silver: {
    label: '白银',
    ring: 'conic-gradient(from 210deg, #8e939b, #e8ebef 12%, #6f747c 25%, #f4f6f8 40%, #82878f 55%, #e8ebef 70%, #62676e 85%, #8e939b)',
    face: 'radial-gradient(circle at 32% 28%, #eef1f4, #aab0b8 55%, #6f747c)',
    edge: '#4a4e54',
  },
  gold: {
    label: '黄金',
    ring: 'conic-gradient(from 210deg, #a67c1a, #f6d860 12%, #8a6410 25%, #ffe98a 40%, #9c7414 55%, #f6d860 70%, #75550c 85%, #a67c1a)',
    face: 'radial-gradient(circle at 32% 28%, #ffe98a, #d4a72c 55%, #8a6410)',
    edge: '#5c430a',
  },
  rose: {
    label: '玫瑰金',
    ring: 'conic-gradient(from 210deg, #b76e63, #f2b8a9 12%, #96544a 25%, #ffd0c2 40%, #a05a4f 55%, #f2b8a9 70%, #7e463d 85%, #b76e63)',
    face: 'radial-gradient(circle at 32% 28%, #ffd0c2, #cf8a7a 55%, #8a4f44)',
    edge: '#5e362f',
  },
  obsidian: {
    label: '曜石',
    ring: 'conic-gradient(from 210deg, #23202e, #5c5570 12%, #171420 25%, #7d7494 40%, #201c2b 55%, #5c5570 70%, #100d18 85%, #23202e)',
    face: 'radial-gradient(circle at 32% 28%, #4a4358, #2a2536 55%, #141118)',
    edge: '#0a0810',
  },
}
