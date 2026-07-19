export type CategoryId =
  | 'sport' | 'outdoor' | 'food' | 'reading' | 'create' | 'social'
  | 'travel' | 'nature' | 'focus' | 'life' | 'kindness' | 'milestone'

export interface Category {
  id: CategoryId
  name: string
  en: string
  color: string
}

export interface BadgeDef {
  id: string
  category: CategoryId
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  name: string
  desc: string
}

export interface EarnedInfo {
  count: number
  latest: string // ISO date
}

export interface PhotoEntry {
  id: string
  day: string // YYYY-MM-DD
  createdAt: number
  photo: string // dataURL or objectURL
  video?: string // live photo
  category: CategoryId
  hue: number
  diary?: string
  diaryTitle?: string
  suishuinian?: string
  chat?: { role: 'me' | 'ai'; text: string }[]
  voice?: string // audio objectURL
  voiceName?: string
  mood?: number // 1-5
}

export type TabId = 'home' | 'calendar' | 'badges' | 'me'
