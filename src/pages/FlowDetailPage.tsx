import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Play, Share2, Edit2, ChevronRight, Plus, Upload, Presentation } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { SortableScreenList } from '@/components/flow/SortableScreenList'
import { FlowViewer } from '@/components/flow/FlowViewer'
import { ShareModal } from '@/components/share/ShareModal'
import { useArchiveStore } from '@/store/archiveStore'
import { DropZone, type UploadedFile } from '@/components/upload/DropZone'

export function FlowDetailPage() {
  const { appId, flowId } = useParams<{ appId: string; flowId: string }>()
  const navigate = useNavigate()
  const {
    apps, features, flows, getScreensByFlow, updateFlow, addScreens,
  } = useArchiveStore()

  const app = apps.find(a => a.id === appId)
  const flow = flows.find(f => f.id === flowId)
  const feature = features.find(f => f.id === flow?.featureId)
  const screens = flowId ? getScreensByFlow(flowId) : []

  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(flow?.name ?? '')
  const [editDesc, setEditDesc] = useState(flow?.description ?? '')
  const [editTags, setEditTags] = useState(flow?.tags.join(', ') ?? '')
  const [showUpload, setShowUpload] = useState(false)

  if (!flow || !app) {
    return (
      <AppLayout title="플로우 없음">
        <div className="flex items-center justify-center h-64 text-text-muted text-sm">
          플로우를 찾을 수 없습니다.
        </div>
      </AppLayout>
    )
  }

  const handleSave = () => {
    updateFlow(flow.id, {
      name: editName || flow.name,
      description: editDesc || undefined,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
    })
    setEditing(false)
  }

  const handleOpenLightbox = (i: number) => {
    setViewerIndex(i)
    setViewerOpen(true)
  }

  const handleAddScreens = (files: UploadedFile[]) => {
    if (!flowId || !flow) return
    addScreens(files.map((f, i) => ({
      appId: flow.appId,
      featureId: flow.featureId,
      flowId: flow.id,
      filename: f.filename,
      imageData: f.imageData,
      order: screens.length + i,
      tags: [],
    })))
    setShowUpload(false)
  }

  return (
    <AppLayout
      title={flow.name}
      headerActions={
        <div className="flex items-center gap-1">
          <button className="btn-ghost text-xs gap-1.5 h-8" onClick={() => setShareOpen(true)}>
            <Share2 size={13} />공유
          </button>
          <button
            className="btn-primary text-xs gap-1.5 h-8"
            onClick={() => { setViewerIndex(0); setViewerOpen(true) }}
            disabled={screens.length === 0}
          >
            <Presentation size={13} />프레젠테이션
          </button>
        </div>
      }
    >
      <div className="px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-4">
          <Link to="/" className="hover:text-text-primary">홈</Link>
          <ChevronRight size={12} />
          <Link to={`/app/${app.id}`} className="hover:text-text-primary">{app.name}</Link>
          <ChevronRight size={12} />
          <span className="text-accent">{flow.name}</span>
        </nav>

        {/* Flow header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-accent flex-shrink-0">
            <Play size={15} />
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full h-9 text-sm font-semibold"
                  placeholder="플로우명"
                />
                <input
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full h-8 text-sm"
                  placeholder="설명"
                />
                <input
                  value={editTags}
                  onChange={e => setEditTags(e.target.value)}
                  className="w-full h-8 text-sm"
                  placeholder="태그 (쉼표로 구분)"
                />
                <div className="flex gap-2">
                  <button className="btn-primary text-xs h-7" onClick={handleSave}>저장</button>
                  <button className="btn-ghost text-xs h-7" onClick={() => setEditing(false)}>취소</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-base font-bold text-text-primary">{flow.name}</h1>
                {flow.description && (
                  <p className="text-sm text-text-muted mt-0.5">{flow.description}</p>
                )}
                {flow.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {flow.tags.map(t => <span key={t} className="tag text-[11px]">{t}</span>)}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs text-text-muted">{screens.length}화면</span>
            <button className="btn-ghost p-1.5" onClick={() => setEditing(v => !v)}>
              <Edit2 size={14} />
            </button>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-text-muted">드래그해서 순서를 바꿀 수 있습니다.</p>
          <button
            className="btn-outline text-xs gap-1.5"
            onClick={() => setShowUpload(v => !v)}
          >
            <Upload size={13} />화면 추가
          </button>
        </div>

        {/* Upload zone */}
        {showUpload && (
          <div className="mb-6 animate-slide-in">
            <DropZone onFiles={handleAddScreens} />
          </div>
        )}

        {/* Screens */}
        {screens.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center">
            <p className="text-sm font-medium text-text-primary mb-1">화면이 없습니다</p>
            <p className="text-xs text-text-muted mb-4">이 플로우에 화면 캡처를 추가하세요.</p>
            <button className="btn-outline text-xs" onClick={() => setShowUpload(true)}>
              <Plus size={13} />화면 추가
            </button>
          </div>
        ) : (
          <SortableScreenList flowId={flow.id} onOpenLightbox={handleOpenLightbox} />
        )}
      </div>

      {/* Flow viewer */}
      {viewerOpen && (
        <FlowViewer
          screens={screens}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
          title={flow.name}
        />
      )}

      {/* Share modal */}
      {shareOpen && (
        <ShareModal
          defaultType="flow"
          defaultTargetId={flow.id}
          onClose={() => setShareOpen(false)}
        />
      )}
    </AppLayout>
  )
}
