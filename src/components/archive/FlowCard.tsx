import { useNavigate } from 'react-router-dom'
import { Play, MoreHorizontal, Trash2 } from 'lucide-react'
import { useArchiveStore } from '@/store/archiveStore'
import { useImage } from '@/lib/useImage'
import { cn } from '@/lib/utils'
import type { Flow } from '@/store/types'
import { useState, useRef, useEffect } from 'react'

function FlowThumb({ id, filename, single }: { id: string; filename: string; single: boolean }) {
  const src = useImage(id)
  return (
    <div className={cn('flex-1 aspect-[9/16] overflow-hidden rounded-sm', single && 'max-w-[72px]')}>
      {src
        ? <img src={src} alt={filename} className="w-full h-full object-cover" loading="lazy" />
        : <div className="w-full h-full bg-bg-card" />}
    </div>
  )
}

interface FlowCardProps {
  flow: Flow
}

export function FlowCard({ flow }: FlowCardProps) {
  const navigate = useNavigate()
  const { getScreensByFlow, deleteFlow } = useArchiveStore()
  const screens = getScreensByFlow(flow.id)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const previews = screens.slice(0, 4)

  return (
    <div
      className="card group cursor-pointer hover:border-accent/40 transition-all animate-slide-in"
      onClick={() => navigate(`/app/${flow.appId}/flow/${flow.id}`)}
    >
      {/* Thumbnail strip */}
      <div className="flex gap-1 p-2 bg-bg-elevated overflow-hidden">
        {previews.length > 0 ? (
          previews.map((sc) => (
            <FlowThumb key={sc.id} id={sc.id} filename={sc.filename} single={previews.length === 1} />
          ))
        ) : (
          <div className="w-full h-16 flex items-center justify-center">
            <Play size={18} className="text-text-muted opacity-20" />
          </div>
        )}
        {screens.length > 4 && (
          <div className="flex-1 aspect-[9/16] rounded-sm bg-bg-card flex items-center justify-center text-xs text-text-muted">
            +{screens.length - 4}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-text-primary truncate flex items-center gap-1.5">
              <Play size={11} className="text-accent flex-shrink-0" />
              {flow.name}
            </h4>
            {flow.description && (
              <p className="text-xs text-text-muted mt-0.5 truncate">{flow.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs text-text-muted">{screens.length}화면</span>
            <div className="relative" ref={menuRef}>
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
                className="btn-ghost p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal size={14} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-bg-elevated border border-border rounded-md shadow-xl z-10 py-1 animate-fade-in">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-card"
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); navigate(`/app/${flow.appId}/flow/${flow.id}`) }}
                  >
                    <Play size={12} />보기
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                    onClick={e => {
                      e.stopPropagation()
                      setMenuOpen(false)
                      if (confirm(`"${flow.name}" 플로우를 삭제할까요?`)) deleteFlow(flow.id)
                    }}
                  >
                    <Trash2 size={12} />삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        {flow.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {flow.tags.map(t => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
