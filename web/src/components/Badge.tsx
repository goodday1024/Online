import { useState } from 'react'
import type { BadgeDef, EarnedInfo } from '@/types'
import { METALS, metalOf } from '@/data/badges'
import { CategoryIcon } from '@/lib/icons'

export function BadgeCoin({ badge, earned, size = 96, onFlip }: {
  badge: BadgeDef
  earned?: EarnedInfo
  size?: number
  onFlip?: (flipped: boolean) => void
}) {
  const [flipped, setFlipped] = useState(false)
  const [shineKey, setShineKey] = useState(0)
  const metal = METALS[metalOf(badge.tier)]
  const locked = !earned

  const flip = () => {
    const f = !flipped
    setFlipped(f)
    setShineKey((k) => k + 1)
    onFlip?.(f)
  }

  return (
    <button
      className="badge-scene"
      style={{ width: size, height: size }}
      onClick={flip}
      aria-label={badge.name}
    >
      <div className={`badge-coin ${flipped ? 'is-flipped' : ''}`}>
        {/* 正面 */}
        <div className="badge-face badge-front" style={{ background: metal.ring, boxShadow: `0 6px 14px rgba(60,45,30,.35), inset 0 0 0 1px ${metal.edge}` }}>
          <div className="badge-inner" style={{ background: metal.face, boxShadow: `inset 0 2px 6px rgba(255,255,255,.5), inset 0 -3px 8px rgba(0,0,0,.35)` }}>
            <span className={locked ? 'opacity-40' : ''} style={{ color: metal.edge }}>
              <CategoryIcon id={badge.category} size={size * 0.34} strokeWidth={1.9} />
            </span>
            {locked && (
              <span className="badge-lock">
                <svg width={size * 0.2} height={size * 0.2} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
              </span>
            )}
          </div>
          <span key={shineKey} className="badge-shine" />
          {locked && <div className="badge-frost" />}
        </div>
        {/* 背面 */}
        <div className="badge-face badge-back" style={{ background: metal.ring, boxShadow: `0 6px 14px rgba(60,45,30,.35), inset 0 0 0 1px ${metal.edge}` }}>
          <div className="badge-inner flex flex-col items-center justify-center gap-0.5" style={{ background: metal.face, boxShadow: `inset 0 2px 6px rgba(255,255,255,.4), inset 0 -3px 8px rgba(0,0,0,.35)` }}>
            {earned ? (
              <>
                <span className="badge-back-label" style={{ color: metal.edge }}>最近获得</span>
                <span className="badge-back-date" style={{ color: metal.edge }}>{earned.latest.replaceAll('-', '.')}</span>
                <span className="badge-back-count" style={{ color: metal.edge }}>×{earned.count}</span>
              </>
            ) : (
              <>
                <span className="badge-back-label" style={{ color: metal.edge }}>尚未解锁</span>
                <span className="badge-back-count" style={{ color: metal.edge }}>{badge.desc}</span>
              </>
            )}
          </div>
          <span key={`b${shineKey}`} className="badge-shine" />
        </div>
      </div>
    </button>
  )
}
