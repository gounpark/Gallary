import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Play, ChevronLeft, ChevronRight, LayoutGrid, X, MessageSquare } from 'lucide-react'
import { useArchiveStore } from '@/store/archiveStore'
import { FlowViewer } from '@/components/flow/FlowViewer'
import { useImage } from '@/lib/useImage'
import { cn } from '@/lib/utils'
import type { Screen } from '@/store/types'

function ShareScreenImg({ id, filename }: { id: string; filename: string }) {
  const src = useImage(id)
  return src ? <img src={src} alt={filename} className="w-full h-full object-cover" loading="lazy" /> : null
}

export function SharePage() {
  const { shareId } = useParams<{ shareId: string }>()
  const { shareLinks, apps, features, flows, screens, getScreensByFlow, getFeaturesByApp, getFlowsByFeature } = useArchiveStore()

  const link = shareLinks.find(l => l.id === shareId)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerScreens, setViewerScreens] = useState<Screen[]>([])
  const [viewerIndex, setViewerIndex] = useState(0)
  const [viewerTitle, setViewerTitle] = useState('')

  if (!link) {
    return (
      <div className="min-h-dvh bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-text-primary mb-1">공유 링크를 찾을 수 없습니다</p>
          <p className="text-xs text-text-muted">링크가 만료되었거나 삭제되었을 수 있습니다.</p>
          <Link to="/" className="btn-primary text-xs mt-4 inline-flex">홈으로</Link>
        </div>
      </div>
    )
  }

  const openViewer = (scrs: Screen[], index: number, title: string) => {
    setViewerScreens(scrs)
    setViewerIndex(index)
    setViewerTitle(title)
    setViewerOpen(true)
  }

  // Build content based on share type
  const renderContent = () => {
    if (link.type === 'app') {
      const app = apps.find(a => a.id === link.targetId)
      if (!app) return null
      const appFeatures = getFeaturesByApp(app.id)

      return (
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: app.color }} />
            <div>
              <h1 className="text-xl font-bold text-text-primary">{app.name}</h1>
              {app.description && <p className="text-sm text-text-muted">{app.description}</p>}
            </div>
          </div>
          {appFeatures.map(feat => {
            const featFlows = getFlowsByFeature(feat.id)
            return (
              <div key={feat.id} className="mb-8">
                <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-accent inline-block" />
                  {feat.name}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {featFlows.map(flow => {
                    const flowScreens = getScreensByFlow(flow.id)
                    return (
                      <FlowShareCard
                        key={flow.id}
                        flow={flow}
                        screens={flowScreens}
                        onPlay={() => openViewer(flowScreens, 0, flow.name)}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    if (link.type === 'feature') {
      const feature = features.find(f => f.id === link.targetId)
      const app = apps.find(a => a.id === feature?.appId)
      if (!feature || !app) return null
      const featFlows = getFlowsByFeature(feature.id)

      return (
        <div>
          <div className="mb-8">
            <p className="text-xs text-text-muted mb-1">{app.name}</p>
            <h1 className="text-xl font-bold text-text-primary">{feature.name}</h1>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {featFlows.map(flow => {
              const flowScreens = getScreensByFlow(flow.id)
              return (
                <FlowShareCard
                  key={flow.id}
                  flow={flow}
                  screens={flowScreens}
                  onPlay={() => openViewer(flowScreens, 0, flow.name)}
                />
              )
            })}
          </div>
        </div>
      )
    }

    if (link.type === 'flow') {
      const flow = flows.find(f => f.id === link.targetId)
      const feature = features.find(f => f.id === flow?.featureId)
      const app = apps.find(a => a.id === flow?.appId)
      if (!flow) return null
      const flowScreens = getScreensByFlow(flow.id)

      return (
        <div>
          <div className="mb-6">
            <p className="text-xs text-text-muted mb-1">
              {app?.name} · {feature?.name}
            </p>
            <h1 className="text-xl font-bold text-text-primary mb-2">{flow.name}</h1>
            {flow.description && <p className="text-sm text-text-muted">{flow.description}</p>}
          </div>

          <button
            className="btn-primary text-sm mb-6"
            onClick={() => openViewer(flowScreens, 0, flow.name)}
          >
            <Play size={15} />전체 플로우 보기
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {flowScreens.map((sc, i) => (
              <div
                key={sc.id}
                className="card overflow-hidden cursor-pointer hover:border-accent/40 transition-all"
                onClick={() => openViewer(flowScreens, i, flow.name)}
              >
                <div className="aspect-[9/16] bg-bg-elevated relative">
                  <ShareScreenImg id={sc.id} filename={sc.filename} />
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-[10px] text-white">
                    {i + 1}
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-text-primary truncate">{sc.title ?? sc.filename}</p>
                  {sc.memo && (
                    <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">
                      <MessageSquare size={10} className="inline mr-0.5" />
                      {sc.memo}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-dvh bg-bg-base">
      {/* Minimal header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 h-12 bg-bg-base/80 backdrop-blur border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center">
            <LayoutGrid size={11} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-text-primary">Gallary</span>
          {link.label && (
            <>
              <span className="text-border">·</span>
              <span className="text-xs text-text-muted">{link.label}</span>
            </>
          )}
        </div>
        <span className="text-xs text-text-muted">공유 보기</span>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {viewerOpen && (
        <FlowViewer
          screens={viewerScreens}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
          title={viewerTitle}
        />
      )}
    </div>
  )
}

interface FlowShareCardProps {
  flow: { id: string; name: string; description?: string }
  screens: Screen[]
  onPlay: () => void
}

function FlowShareCard({ flow, screens, onPlay }: FlowShareCardProps) {
  const preview = screens[0]
  const previewSrc = useImage(preview?.id ?? '')
  return (
    <div className="card overflow-hidden cursor-pointer hover:border-accent/40 transition-all" onClick={onPlay}>
      <div className="aspect-video bg-bg-elevated relative">
        {previewSrc ? (
          <img src={previewSrc} alt={flow.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play size={20} className="text-text-muted opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Play size={16} className="text-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium text-text-primary truncate">{flow.name}</p>
        <p className="text-[11px] text-text-muted">{screens.length}화면</p>
      </div>
    </div>
  )
}
