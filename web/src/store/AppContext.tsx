import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import type { EarnedInfo, PhotoEntry, TabId } from '@/types'
import { BADGES } from '@/data/badges'
import { seedEntries } from '@/lib/demo'

interface State {
  tab: TabId
  entries: PhotoEntry[]
  earned: Record<string, EarnedInfo>
  suishuinianFor: string | null // entry id,打开碎碎念模式
  detailFor: { day: string; index: number } | null
  toast: { badgeId: string } | null
}

type Action =
  | { type: 'tab'; tab: TabId }
  | { type: 'add'; entry: PhotoEntry }
  | { type: 'update'; id: string; patch: Partial<PhotoEntry> }
  | { type: 'earn'; category: string }
  | { type: 'openSui'; id: string | null }
  | { type: 'openDetail'; day: string; index: number }
  | { type: 'closeDetail' }
  | { type: 'clearToast' }

function seedEarned(entries: PhotoEntry[]): Record<string, EarnedInfo> {
  const earned: Record<string, EarnedInfo> = {}
  for (const b of BADGES) {
    const list = entries.filter((e) => e.category === b.category).sort((a, b2) => a.day.localeCompare(b2.day))
    const need = b.tier === 1 ? 1 : b.tier === 2 ? 3 : b.tier === 3 ? 5 : b.tier === 4 ? 7 : b.tier === 5 ? 9 : b.tier === 6 ? 12 : b.tier === 7 ? 15 : b.tier === 8 ? 18 : 21
    if (list.length >= need) {
      earned[b.id] = { count: list.length, latest: list[list.length - 1].day }
    }
  }
  // 保证演示时至少有一小把已解锁勋章
  const fallback: [string, number][] = [['life-1', 4], ['life-2', 6], ['nature-1', 3], ['food-1', 2], ['sport-1', 5], ['travel-1', 1], ['reading-1', 8], ['social-1', 2], ['focus-1', 3], ['create-1', 1], ['outdoor-1', 2], ['milestone-1', 1]]
  const today = new Date()
  fallback.forEach(([id, daysAgo], i) => {
    if (!earned[id]) {
      const d = new Date(today)
      d.setDate(d.getDate() - daysAgo - i)
      earned[id] = { count: 1 + (i % 3), latest: d.toISOString().slice(0, 10) }
    }
  })
  return earned
}

function init(): State {
  const entries = seedEntries()
  return {
    tab: (location.hash.replace('#', '') as TabId) || 'home',
    entries,
    earned: seedEarned(entries),
    suishuinianFor: null,
    detailFor: null,
    toast: null,
  }
}

const THRESHOLDS = [1, 3, 5, 7, 9, 12, 15, 18, 21]

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'tab': return { ...s, tab: a.tab }
    case 'add': return { ...s, entries: [a.entry, ...s.entries] }
    case 'update':
      return { ...s, entries: s.entries.map((e) => (e.id === a.id ? { ...e, ...a.patch } : e)) }
    case 'earn': {
      const count = s.entries.filter((e) => e.category === a.category).length
      const badge = BADGES.filter((b) => b.category === a.category)
        .sort((x, y) => y.tier - x.tier)
        .find((b) => count >= THRESHOLDS[b.tier - 1])
      if (!badge) return s
      const prev = s.earned[badge.id]
      const today = new Date().toISOString().slice(0, 10)
      const isNew = !prev
      const next = {
        ...s.earned,
        [badge.id]: { count, latest: today },
      }
      return { ...s, earned: next, toast: isNew ? { badgeId: badge.id } : s.toast }
    }
    case 'openSui': return { ...s, suishuinianFor: a.id }
    case 'openDetail': return { ...s, detailFor: { day: a.day, index: a.index } }
    case 'closeDetail': return { ...s, detailFor: null }
    case 'clearToast': return { ...s, toast: null }
    default: return s
  }
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const v = useMemo(() => ({ state, dispatch }), [state])
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside provider')
  return v
}
