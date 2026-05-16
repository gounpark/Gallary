import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Trash2, Edit2, MessageSquare, GripVertical } from 'lucide-react'
import { useArchiveStore } from '@/store/archiveStore'
import { useImage } from '@/lib/useImage'
import { cn } from '@/lib/utils'
import type { Screen } from '@/store/types'

interface ScreenCardProps {
  screen: Screen
  index: number
  onOpenLightbox?: (index: number) => void
  sortable?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  isDragging?: boolean
}

export function ScreenCard({
  screen, index, onOpenLightbox, sortable, dragHandleProps, isDragging,
}: ScreenCardProps) {
  const { updateScreen, deleteScreen } = useArchiveStore()
  const imageSrc = useImage(screen.id)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [memo, setMemo] = useState(screen.memo ?? '')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const saveMemo = () => {
    updateScreen(screen.id, { memo })
    setEditing(false)
  }

  return (
    <div
      className={cn(
        'card group relative overflow-hidden transition-all',
        isDragging && 'opacity-50 scale-95 ring-2 ring-accent',
      )}
    >
      {/* Drag handle */}
      {sortable && (
        <div
          {...dragHandleProps}
          className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary"
        >
          <GripVertical size={15} />
        </div>
      )}

      {/* Index badge */}
      <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-[10px] text-white font-mono">
        {index + 1}
      </div>

      {/* Menu */}
      <div className="absolute top-8 right-2 z-10" ref={menuRef}>
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
        >
          <MoreHorizontal size={13} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-36 bg-bg-elevated border border-border rounded-lg shadow-xl z-20 py-1 animate-fade-in">
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-card hover:text-text-primary"
              onClick={() => { setMenuOpen(false); setEditing(true) }}
            >
              <Edit2 size={12} />메모 편집
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
              onClick={() => {
                setMenuOpen(false)
                if (confirm('이 화면을 삭제할까요?')) deleteScreen(screen.id)
              }}
            >
              <Trash2 size={12} />삭제
            </button>
          </div>
        )}
      </div>

      {/* Image */}
      <div
        className="aspect-[9/16] sm:aspect-[3/4] overflow-hidden cursor-pointer bg-bg-elevated"
        onClick={() => onOpenLightbox?.(index)}
      >
        <img
          src={imageSrc}
          alt={screen.title ?? screen.filename}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs font-medium text-text-primary truncate">
          {screen.title || screen.filename}
        </p>

        {/* Memo */}
        {editing ? (
          <div className="mt-1.5 space-y-1.5">
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="화면 설명 메모…"
              rows={2}
              className="w-full text-xs resize-none"
              autoFocus
            />
            <div className="flex gap-1.5">
              <button className="btn-primary h-6 text-xs" onClick={saveMemo}>저장</button>
              <button className="btn-ghost h-6 text-xs" onClick={() => { setMemo(screen.memo ?? ''); setEditing(false) }}>취소</button>
            </div>
          </div>
        ) : screen.memo ? (
          <p
            className="text-xs text-text-muted mt-1 leading-relaxed cursor-pointer hover:text-text-secondary"
            onClick={() => setEditing(true)}
          >
            <MessageSquare size={10} className="inline mr-1 opacity-60" />
            {screen.memo}
          </p>
        ) : (
          <button
            className="text-xs text-text-muted mt-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
            onClick={() => setEditing(true)}
          >
            + 메모 추가
          </button>
        )}

        {/* Tags */}
        {screen.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {screen.tags.map(t => (
              <span key={t} className="tag text-[10px]">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
