import type { CategoryId } from '@/types'

// 24x24 stroke icons, hand-drawn feel
const P: Record<CategoryId, string> = {
  sport: 'M4 17l4-9 4 5 3-7 5 11M2 21h20',
  outdoor: 'M3 19l6-12 4 7 3-4 5 9H3zM17 5a2 2 0 100 .01',
  food: 'M7 3v8M10 3v8M8.5 11v10M8.5 11c-1.5 0-2.5-1.8-2.5-4M8.5 11c1.5 0 2.5-1.8 2.5-4M16 3c-2 1-3 4-3 7 0 2 1 3 3 3v8M16 3v18',
  reading: 'M12 6c-2-1.5-4.5-2-8-2v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2V4c-3.5 0-6 .5-8 2zM12 6v14',
  create: 'M15 4l5 5L8 21l-5 1 1-5L15 4zM13 6l5 5',
  social: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16.5 4.6a3.5 3.5 0 010 5.8M17.8 14.9c2.1.7 3.4 2.4 3.9 4.6',
  travel: 'M10.5 20.5L3 21l.5-7.5L17 3.9c1.2-1.2 3.4-1.1 4.2.5.7 1.5.1 3-1 3.6L10.5 20.5zM13.5 6.5l4 4M3 21l4.5-4.5',
  nature: 'M12 21c-5 0-8-3.5-8-8 0-6 5-9 13-10 1 0 2 1 2 2-1 8-3 16-7 16zM12 21c0-6 3-10 7-13',
  focus: 'M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0M12 12m-7.5 0a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3',
  life: 'M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-6h4v6',
  kindness: 'M12 20s-7.5-4.6-9.3-9.2C1.5 7.7 3.6 4.5 6.8 4.5c2 0 3.7 1.1 5.2 3 1.5-1.9 3.2-3 5.2-3 3.2 0 5.3 3.2 4.1 6.3C19.5 15.4 12 20 12 20z',
  milestone: 'M5 21V4M5 4c4-2 8 2 14 0v9c-6 2-10-2-14 0',
}

export function CategoryIcon({ id, size = 20, strokeWidth = 1.7, className }: {
  id: CategoryId; size?: number; strokeWidth?: number; className?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={P[id]} />
    </svg>
  )
}

export const UI = {
  camera: 'M4 8h3l2-3h6l2 3h3v12H4V8zM12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
  home: 'M4 11l8-7 8 7M6 9.5V20h12V9.5',
  calendar: 'M4 5h16v16H4V5zM4 9h16M8 3v4M16 3v4',
  medal: 'M12 14a5 5 0 100-10 5 5 0 000 10zM8.5 13L6 21l6-3 6 3-2.5-8',
  user: 'M12 11a4 4 0 100-8 4 4 0 000 8zM4 21c1-4 4.3-6 8-6s7 2 8 6',
  mic: 'M12 3a3 3 0 013 3v5a3 3 0 01-6 0V6a3 3 0 013-3zM6 11a6 6 0 0012 0M12 17v4M9 21h6',
  close: 'M6 6l12 12M18 6L6 18',
  play: 'M8 5l12 7-12 7V5z',
  pause: 'M7 5h4v14H7zM13 5h4v14h-4z',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16z',
  flame: 'M12 22c-4 0-7-2.8-7-6.5 0-3 2-5 3.5-7C10 6 11 4 11 2c3 2 3.5 5 3 7 .8-.3 1.6-1 2-2.5 1.5 2 3 4.3 3 7 0 4.7-3 8.5-7 8.5z',
  back: 'M15 5l-7 7 7 7',
  send: 'M3 11l18-8-8 18-2.5-7.5L3 11z',
  vinyl: 'M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0M12 6.5a5.5 5.5 0 015.5 5.5M6.5 12A5.5 5.5 0 0112 6.5',
  export: 'M12 15V3M7 8l5-5 5 5M4 15v5h16v-5',
  book: 'M5 4h10a4 4 0 014 4v12H9a4 4 0 00-4 4V4zM5 20a4 4 0 014-4h10',
}

export function UIIcon({ d, size = 20, strokeWidth = 1.7, className }: {
  d: string; size?: number; strokeWidth?: number; className?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}
