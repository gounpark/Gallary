import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, X, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useImage } from '@/lib/useImage'
import type { Screen } from '@/store/types'

interface FlowViewerProps {
  screens: Screen[]
  initialIndex?: number
  onClose: () => void
  title?: string
}

export function FlowViewer({ screens, initialIndex = 0, onClose, title }: FlowViewerProps) {
  const [current, setCurrent] = useState(initialIndex)
  const screen = screens[current]
  const imageSrc = useImage(screen?.id ?? '')

  const touchStartX = useRef<number | null>(null)

  const prev = () => setCurrent(i => Math.max(0, i - 1))
  const next = () => setCurrent(i => Math.min(screens.length - 1, i + 1))

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'Escape') onClose()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx > 50) prev()
    else if (dx < -50) next()
    touchStartX.current = null
  }

  if (screens.length === 0) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onKeyDown={handleKey}
      tabIndex={-1}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="btn-ghost text-white/70 hover:text-white p-1.5">
            <X size={18} />
          </button>
          {title && (
            <span className="text-sm font-medium text-white/80">{title}</span>
          )}
        </div>
        <span className="text-sm text-white/50 font-mono">
          {current + 1} / {screens.length}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden px-4">
        {/* Prev button */}
        <button
          onClick={prev}
          disabled={current === 0}
          className={cn(
            'absolute left-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all',
            current === 0 && 'opacity-20 pointer-events-none',
          )}
        >
          <ChevronLeft size={20} />
        </button>

        {/* Image */}
        <div className="max-h-full max-w-sm w-full relative">
          <img
            key={screen.id}
            src={imageSrc}
            alt={screen.title ?? screen.filename}
            className="w-full h-full object-contain rounded-xl shadow-2xl animate-fade-in"
            style={{ maxHeight: 'calc(100dvh - 180px)' }}
          />
        </div>

        {/* Next button */}
        <button
          onClick={next}
          disabled={current === screens.length - 1}
          className={cn(
            'absolute right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all',
            current === screens.length - 1 && 'opacity-20 pointer-events-none',
          )}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Bottom: title + memo */}
      <div className="px-4 py-3 bg-black/60 text-center">
        <p className="text-sm font-medium text-white/90">
          {screen.title ?? screen.filename}
        </p>
        {screen.memo && (
          <p className="text-xs text-white/50 mt-1 flex items-center justify-center gap-1">
            <MessageSquare size={11} />
            {screen.memo}
          </p>
        )}

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {screens.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                i === current ? 'bg-white w-4' : 'bg-white/30',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
