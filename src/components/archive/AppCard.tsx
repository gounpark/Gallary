import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Trash2, Edit2, Images } from 'lucide-react'
import { useArchiveStore } from '@/store/archiveStore'
import { useImage } from '@/lib/useImage'
import type { App } from '@/store/types'
import { useState, useRef, useEffect } from 'react'

interface AppCardProps {
  app: App
}

export function AppCard({ app }: AppCardProps) {
  const navigate = useNavigate()
  const { features, flows, screens, deleteApp, setSelectedApp } = useArchiveStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const appFeatures = features.filter(f => f.appId === app.id)
  const appFlowIds = flows.filter(f => f.appId === app.id).map(f => f.id)
  const screenCount = screens.filter(sc => appFlowIds.includes(sc.flowId)).length
  const preview = screens.find(sc => appFlowIds.includes(sc.flowId))
  const previewSrc = useImage(preview?.id ?? '')

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div
      className="group cursor-pointer animate-fade-in"
      onClick={() => { setSelectedApp(app.id); navigate(`/app/${app.id}`) }}
    >
      {/* Portrait thumbnail */}
      <div className="aspect-[9/19] bg-bg-elevated relative overflow-hidden rounded-3xl mb-4">
        {previewSrc ? (
          <img
            src={previewSrc}
            alt={app.name}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Images size={40} className="text-text-muted opacity-20" />
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="flex items-center gap-3 px-0.5">
        {/* App color icon */}
        <div
          className="w-10 h-10 rounded-lg flex-shrink-0"
          style={{ backgroundColor: app.color }}
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-text-primary text-lg sm:text-base leading-tight truncate">{app.name}</h3>
          <p className="text-sm text-text-muted mt-0.5 hidden sm:block">
            {appFeatures.length}개 기능 · {screenCount}개 화면
          </p>
        </div>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
            className="btn-ghost p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-bg-elevated border border-border rounded-md shadow-xl z-10 py-1 animate-fade-in">
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-card hover:text-text-primary"
                onClick={e => { e.stopPropagation(); setMenuOpen(false); navigate(`/app/${app.id}`) }}
              >
                <Edit2 size={13} />열기
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
                onClick={e => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  if (confirm(`"${app.name}" 앱과 모든 데이터를 삭제할까요?`)) deleteApp(app.id)
                }}
              >
                <Trash2 size={13} />삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
