import { useState, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Share2, Settings, Trash2, Edit2, FolderPlus, Filter, X, CheckSquare, Download, Copy, Check } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { FeatureSection } from '@/components/archive/FeatureSection'
import { ShareModal } from '@/components/share/ShareModal'
import { useArchiveStore } from '@/store/archiveStore'
import { useImage } from '@/lib/useImage'
import { APP_COLORS } from '@/lib/utils'
import { copyScreenToClipboard, downloadScreensAsZip } from '@/lib/exportUtils'

function ScreenGridItem({ screen, index }: { screen: any; index: number }) {
  const src = useImage(screen.id)
  return (
    <div className="group relative cursor-pointer rounded-lg overflow-hidden bg-bg-elevated border border-border/60 hover:border-accent/50 hover:shadow-lg transition-all duration-150" style={{ aspectRatio: '9/16' }}>
      {src ? (
        <img src={src} alt={screen.title ?? screen.filename} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full bg-bg-card animate-pulse" />
      )}
      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center text-[10px] text-white font-mono">
        {index + 1}
      </div>
      {screen.memo && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
          <p className="text-[10px] text-white/80 truncate flex items-center gap-1">
            <span>💬</span>
            {screen.memo}
          </p>
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${month}월, ${d.getFullYear()}년`
}

export function AppDetailPage() {
  const { appId } = useParams<{ appId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { apps, getFeaturesByApp, getFlowsByFeature, getScreensByFlow, addFeature, updateApp, deleteApp } = useArchiveStore()

  const app = apps.find(a => a.id === appId)
  const features = appId ? getFeaturesByApp(appId) : []
  const allFlows = appId ? features.flatMap(f => getFlowsByFeature(f.id)) : []

  const selectedFlowId = searchParams.get('flow') || null
  const setSelectedFlowId = (flowId: string | null) => {
    const newParams = new URLSearchParams(searchParams)
    if (flowId) {
      newParams.set('flow', flowId)
    } else {
      newParams.delete('flow')
    }
    setSearchParams(newParams)
  }

  const [showShare, setShowShare] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showFlowFilter, setShowFlowFilter] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const selectAllInFlow = useCallback((ids: string[]) => {
    const allSelected = ids.every(id => selectedIds.has(id))
    setSelectionMode(true)
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allSelected) {
        ids.forEach(id => next.delete(id))
      } else {
        ids.forEach(id => next.add(id))
      }
      return next
    })
  }, [selectedIds])

  const exitSelection = () => {
    setSelectionMode(false)
    setSelectedIds(new Set())
    setActionStatus('idle')
  }

  const allScreens = features.flatMap(f =>
    (appId ? [] : []).concat(
      ...allFlows.map(fl => [])
    )
  )

  const handleCopySelected = async () => {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    setActionStatus('loading')
    try {
      if (ids.length === 1) {
        await copyScreenToClipboard(ids[0])
      } else {
        // copy first, download rest as zip
        await copyScreenToClipboard(ids[0])
      }
      setActionStatus('done')
      setTimeout(() => setActionStatus('idle'), 1500)
    } catch {
      setActionStatus('idle')
    }
  }

  const handleDownloadSelected = async () => {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    setActionStatus('loading')
    const screens = features
      .flatMap(f => getFlowsByFeature(f.id))
      .flatMap(fl => getScreensByFlow(fl.id))
      .filter(sc => ids.includes(sc.id))
    await downloadScreensAsZip(screens, app?.name ?? 'screens')
    setActionStatus('idle')
  }
  const [newFeatureName, setNewFeatureName] = useState('')
  const [addingFeature, setAddingFeature] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editColor, setEditColor] = useState('')

  if (!app) {
    return (
      <AppLayout title="앱 없음">
        <div className="flex items-center justify-center h-64 text-text-muted text-sm">
          앱을 찾을 수 없습니다.
        </div>
      </AppLayout>
    )
  }

  const handleAddFeature = () => {
    if (!newFeatureName.trim() || !appId) return
    addFeature({ appId, name: newFeatureName.trim() })
    setNewFeatureName('')
    setAddingFeature(false)
  }

  const handleSaveSettings = () => {
    updateApp(app.id, {
      name: editName || app.name,
      description: editDesc,
      color: editColor || app.color,
    })
    setShowSettings(false)
  }

  const handleDeleteApp = () => {
    if (confirm(`"${app.name}" 앱과 모든 데이터를 삭제할까요?`)) {
      deleteApp(app.id)
      navigate('/')
    }
  }

  return (
    <AppLayout
      title={app.name}
      appId={appId}
      selectedFlowId={selectedFlowId}
      hideUploadOnMobile
      headerActions={
        <div className="flex items-center gap-1.5">
          <button
            className={`btn-ghost gap-1.5 h-9 px-3 text-sm ${selectionMode ? 'text-accent' : ''}`}
            onClick={() => selectionMode ? exitSelection() : setSelectionMode(true)}
          >
            <CheckSquare size={15} />
            {selectionMode ? '취소' : '선택'}
          </button>
          <button className="btn-ghost gap-1.5 h-9 px-3 text-sm" onClick={() => setShowShare(true)}>
            <Share2 size={15} />공유
          </button>
          <button
            className="btn-ghost h-9 px-3"
            onClick={() => {
              setEditName(app.name)
              setEditDesc(app.description ?? '')
              setEditColor(app.color)
              setShowSettings(true)
            }}
          >
            <Settings size={16} />
          </button>
        </div>
      }
    >
      {/* Hero section */}
      <div className="bg-bg-elevated border-b border-border">
        <div className="flex flex-col items-center text-center py-10 px-6">
          <div
            className="w-24 h-24 rounded-3xl mb-5 shadow-xl"
            style={{ backgroundColor: app.color }}
          />
          <h1 className="text-4xl font-bold text-text-primary mb-2 leading-tight">{app.name}</h1>
          {app.description && (
            <p className="text-base text-text-muted mt-1 mb-3 max-w-xs">{app.description}</p>
          )}
          <button
            className="mt-3 px-6 py-2 rounded-full text-sm font-medium border border-border bg-bg-base hover:bg-bg-card transition-colors text-text-secondary"
            onClick={() => setEditMode(v => !v)}
          >
            {editMode ? '편집 완료' : '편집'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 'clamp(24px, 4vw, 64px)' }}>
        {/* Date header */}
        <div className="mb-8">
          <p className="text-xl font-bold text-text-primary mb-2">{formatDate(app.createdAt)}</p>
          <div className="w-10 h-0.5 bg-text-primary rounded-full" />
        </div>

        {/* Flow selector - Desktop only */}
        {allFlows.length > 0 && (
          <div className="mb-8 hidden sm:block">
            <label htmlFor="flow-select" className="block text-xs text-text-muted mb-2">플로우</label>
            <select
              id="flow-select"
              value={selectedFlowId || ''}
              onChange={e => setSelectedFlowId(e.target.value || null)}
              className="w-64 h-9 text-sm bg-bg-elevated border border-border rounded-lg px-3"
            >
              <option value="">모든 플로우</option>
              {allFlows.map(flow => (
                <option key={flow.id} value={flow.id}>{flow.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Selected flow - render feature with only selected flow */}
        {selectedFlowId && (
          (() => {
            const flow = allFlows.find(f => f.id === selectedFlowId)
            const feature = flow ? features.find(f => f.id === flow.featureId) : null
            return feature ? (
              <FeatureSection key={feature.id} feature={feature} editMode={editMode} defaultOpen={true}
                selectionMode={selectionMode} selectedIds={selectedIds} onToggleSelect={toggleSelect} onSelectAllInFlow={selectAllInFlow} />
            ) : null
          })()
        )}

        {/* Features (shown when no flow selected) */}
        {!selectedFlowId && (
          <>
            {/* Add feature input */}
            {editMode && addingFeature && (
              <div className="flex gap-2 mb-6 animate-slide-in">
                <input
                  value={newFeatureName}
                  onChange={e => setNewFeatureName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddFeature()
                    if (e.key === 'Escape') setAddingFeature(false)
                  }}
                  placeholder="기능명 (예: 검색, 결제, 마이페이지)"
                  className="flex-1 h-9 text-sm"
                  autoFocus
                />
                <button className="btn-primary text-xs" onClick={handleAddFeature}>추가</button>
                <button className="btn-ghost text-xs" onClick={() => setAddingFeature(false)}>취소</button>
              </div>
            )}

            {/* Edit mode: add feature button */}
            {editMode && !addingFeature && (
              <div className="mb-6">
                <button
                  className="btn-outline text-xs gap-1.5"
                  onClick={() => setAddingFeature(true)}
                >
                  <FolderPlus size={13} />기능 추가
                </button>
              </div>
            )}

            {/* Features */}
            {features.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                <p className="text-sm font-medium text-text-primary mb-1">아직 기능이 없습니다</p>
                <p className="text-xs text-text-muted mb-4">기능을 추가하고 화면 플로우를 정리하세요.</p>
                <button className="btn-outline text-xs" onClick={() => setAddingFeature(true)}>
                  <Plus size={13} />기능 추가
                </button>
              </div>
            ) : (
              features.map(feat => (
                <FeatureSection key={feat.id} feature={feat} editMode={editMode}
                  selectionMode={selectionMode} selectedIds={selectedIds} onToggleSelect={toggleSelect} onSelectAllInFlow={selectAllInFlow} />
              ))
            )}
          </>
        )}
      </div>

      {/* Share modal */}
      {showShare && (
        <ShareModal
          defaultType="app"
          defaultTargetId={app.id}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm animate-slide-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Edit2 size={14} className="text-accent" />앱 설정
              </h2>
              <button onClick={() => setShowSettings(false)} className="btn-ghost p-1">✕</button>
            </div>
            <div className="p-5 space-y-3">
              <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="앱 이름" className="w-full h-9 text-sm" />
              <input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="설명" className="w-full h-9 text-sm" />
              <div>
                <p className="text-xs text-text-muted mb-2">색상</p>
                <div className="flex gap-2 flex-wrap">
                  {APP_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: c, outline: editColor === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t border-border">
              <button className="btn-danger text-xs flex items-center gap-1.5" onClick={handleDeleteApp}>
                <Trash2 size={13} />앱 삭제
              </button>
              <div className="flex-1" />
              <button className="btn-ghost text-xs" onClick={() => setShowSettings(false)}>취소</button>
              <button className="btn-primary text-xs" onClick={handleSaveSettings}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* Selection floating action bar */}
      {selectionMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-bg-card border border-border shadow-2xl backdrop-blur animate-slide-in">
          <span className="text-sm font-medium text-text-primary min-w-[60px]">
            {selectedIds.size}개 선택
          </span>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            className="btn-ghost gap-1.5 h-8 px-3 text-sm disabled:opacity-40"
            disabled={selectedIds.size === 0 || actionStatus === 'loading'}
            onClick={handleCopySelected}
          >
            {actionStatus === 'done'
              ? <><Check size={14} className="text-green-400" />복사됨</>
              : <><Copy size={14} />복사</>}
          </button>
          <button
            className="btn-ghost gap-1.5 h-8 px-3 text-sm disabled:opacity-40"
            disabled={selectedIds.size === 0 || actionStatus === 'loading'}
            onClick={handleDownloadSelected}
          >
            <Download size={14} />ZIP
          </button>
          <button className="btn-ghost h-8 px-3 text-sm text-text-muted" onClick={exitSelection}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Mobile flow filter button */}
      {allFlows.length > 0 && (
        <button
          onClick={() => setShowFlowFilter(true)}
          className="fixed bottom-6 right-6 sm:hidden z-40 w-14 h-14 rounded-full bg-accent hover:bg-accent/90 flex items-center justify-center text-white shadow-lg transition-all"
        >
          <Filter size={20} />
        </button>
      )}

      {/* Flow filter modal - Mobile */}
      {showFlowFilter && (
        <div className="fixed inset-0 z-50 sm:hidden flex items-end bg-black/60 backdrop-blur-sm">
          <div className="w-full bg-bg-card border-t border-border rounded-t-2xl animate-slide-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">플로우 선택</h2>
              <button onClick={() => setShowFlowFilter(false)} className="btn-ghost p-1">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedFlowId(null)
                  setShowFlowFilter(false)
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedFlowId === null
                    ? 'bg-accent/20 text-accent font-medium'
                    : 'hover:bg-bg-elevated text-text-primary'
                }`}
              >
                모든 플로우
              </button>
              {allFlows.map(flow => (
                <button
                  key={flow.id}
                  onClick={() => {
                    setSelectedFlowId(flow.id)
                    setShowFlowFilter(false)
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedFlowId === flow.id
                      ? 'bg-accent/20 text-accent font-medium'
                      : 'hover:bg-bg-elevated text-text-primary'
                  }`}
                >
                  {flow.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
