import { useEffect } from 'react'
import { AppProvider, useApp } from '@/store/AppContext'
import { Home } from '@/sections/Home'
import { Calendar } from '@/sections/Calendar'
import { BadgesWall } from '@/sections/BadgesWall'
import { Profile } from '@/sections/Profile'
import { SuishuinianMode } from '@/components/Suishuinian'
import { BadgeCoin } from '@/components/Badge'
import { BADGES } from '@/data/badges'
import { UIIcon, UI } from '@/lib/icons'
import type { TabId } from '@/types'
import './App.css'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'home', label: '今天', icon: UI.home },
  { id: 'calendar', label: '日历', icon: UI.calendar },
  { id: 'badges', label: '成就', icon: UI.medal },
  { id: 'me', label: '我的', icon: UI.user },
]

function Shell() {
  const { state, dispatch } = useApp()
  const toastBadge = state.toast ? BADGES.find((b) => b.id === state.toast!.badgeId) : null

  useEffect(() => {
    if (state.toast) {
      const t = setTimeout(() => dispatch({ type: 'clearToast' }), 4200)
      return () => clearTimeout(t)
    }
  }, [state.toast])

  return (
    <div className="min-h-screen bg-[#dcd2bf] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-[#ece4d9] relative shadow-2xl">
        {state.tab === 'home' && <Home />}
        {state.tab === 'calendar' && <Calendar />}
        {state.tab === 'badges' && <BadgesWall />}
        {state.tab === 'me' && <Profile />}

        {/* 底部导航 */}
        <nav className="fixed bottom-0 w-full max-w-[430px] bg-[#fffbf5]/92 backdrop-blur border-t border-[#e0d5c2]">
          <div className="grid grid-cols-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => dispatch({ type: 'tab', tab: t.id })}
                className={`flex flex-col items-center gap-0.5 py-1 transition active:scale-90 ${
                  state.tab === t.id ? 'text-[#f54001]' : 'text-[#b0a284]'
                }`}>
                <UIIcon d={t.icon} size={21} />
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* 新成就 toast */}
        {toastBadge && (
          <div className="fixed top-5 z-[60] w-full max-w-[430px] px-5 pointer-events-none">
            <div className="mx-auto w-fit bg-[#2f2a24] text-[#ece4d9] rounded-full pl-2 pr-5 py-2 flex items-center gap-3 shadow-2xl animate-toast">
              <BadgeCoin badge={toastBadge} earned={{ count: 1, latest: new Date().toISOString().slice(0, 10) }} size={44} />
              <div>
                <div className="text-[10px] tracking-[0.25em] text-[#c49a3f]">成就解锁</div>
                <div className="text-sm font-semibold">{toastBadge.name}</div>
              </div>
            </div>
          </div>
        )}

        {/* 碎碎念全屏模式 */}
        {state.suishuinianFor && <SuishuinianMode />}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
