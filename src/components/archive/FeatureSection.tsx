import React, { useState } from 'react'
import { Plus, Trash2, MessageSquare, Bookmark, Share2, ChevronDown, Copy, Check, CheckSquare, Square } from 'lucide-react'
import { useArchiveStore } from '@/store/archiveStore'
import { useImage } from '@/lib/useImage'
import { FlowViewer } from '@/components/flow/FlowViewer'
import { copyScreenToClipboard } from '@/lib/exportUtils'
import type { Feature, Screen } from '@/store/types'

function ScreenThumb({
  screen, index, onClick,
  selectionMode, selected, onToggleSelect,
}: {
  screen: Screen; index: number; total: number; onClick: () => void
  selectionMode?: boolean; selected?: boolean; onToggleSelect?: () => void
}) {
  const src = useImage(screen.id)
  const [copying, setCopying] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setCopying(true)
    try {
      await copyScreenToClipboard(screen.id)
    } catch {
      // fallback: open in new tab
      const url = src
      if (url) window.open(url, '_blank')
    } finally {
      setTimeout(() => setCopying(false), 1500)
    }
  }

  const handleClick = () => {
    if (selectionMode) {
      onToggleSelect?.()
    } else {
      onClick()
    }
  }

  return (
    <div
      className={`group relative flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 ${
        selected ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg-base' : ''
      }`}
      style={{ width: '260px' }}
      onClick={handleClick}
    >
      {src
        ? <img src={src} alt={screen.title ?? screen.filename} className="w-full h-auto block" loading="lazy" />
        : <div className="aspect-[9/16] w-full bg-bg-card animate-pulse rounded-2xl" />}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

      {/* Copy button — non-selection mode only */}
      {!selectionMode && (
        <button
          onClick={handleCopy}
          className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          title="이미지 복사"
        >
          {copying
            ? <Check size={12} className="text-green-400" />
            : <Copy size={12} className="text-white" />}
        </button>
      )}

      {/* Index badge */}
      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center text-[10px] text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity">
        {index + 1}
      </div>

      {/* Selection checkbox */}
      {selectionMode && (
        <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          selected
            ? 'bg-accent border-accent'
            : 'bg-black/40 border-white/60 backdrop-blur'
        }`}>
          {selected && <Check size={13} className="text-white" />}
        </div>
      )}

      {/* Selected overlay */}
      {selected && (
        <div className="absolute inset-0 bg-accent/10 pointer-events-none" />
      )}

      {screen.memo && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-3">
          <p className="text-[11px] text-white/90 truncate flex items-center gap-1">
            <MessageSquare size={9} />
            {screen.memo}
          </p>
        </div>
      )}
    </div>
  )
}

interface FeatureSectionProps {
  feature: Feature
  editMode?: boolean
  defaultOpen?: boolean
  selectionMode?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
  onSelectAllInFlow?: (ids: string[]) => void
}

export function FeatureSection({
  feature, editMode = false, defaultOpen = true,
  selectionMode = false, selectedIds = new Set(), onToggleSelect, onSelectAllInFlow,
}: FeatureSectionProps) {
  const { getFlowsByFeature, getScreensByFlow, getScreenCount, deleteFeature, updateFeature, addFlow } = useArchiveStore()
  const flows = getFlowsByFeature(feature.id)
  const screenCount = getScreenCount(feature.id)

  const [open, setOpen] = useState(defaultOpen)
  const [nameEditing, setNameEditing] = useState(false)
  const [name, setName] = useState(feature.name)
  const [addingFlow, setAddingFlow] = useState(false)
  const [newFlowName, setNewFlowName] = useState('')
  const [viewerScreens, setViewerScreens] = useState<Screen[]>([])
  const [viewerIndex, setViewerIndex] = useState(0)
  const [viewerTitle, setViewerTitle] = useState('')

  const openViewer = (screens: Screen[], index: number, title: string) => {
    setViewerScreens(screens)
    setViewerIndex(index)
    setViewerTitle(title)
  }

  const saveName = () => {
    if (name.trim()) updateFeature(feature.id, { name: name.trim() })
    setNameEditing(false)
  }

  const createFlow = () => {
    if (!newFlowName.trim()) return
    addFlow({ appId: feature.appId, featureId: feature.id, name: newFlowName.trim(), tags: [] })
    setNewFlowName('')
    setAddingFlow(false)
  }

  return (
    <section className="mb-16">
      {/* Feature header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 min-w-0">
          {nameEditing ? (
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setNameEditing(false) }}
              className="text-2xl font-bold bg-transparent border-b border-accent outline-none w-full"
              autoFocus
            />
          ) : (
            <button className="flex items-center gap-2 text-left" onClick={() => setOpen(v => !v)}>
              <h2
                className="text-2xl font-bold text-text-primary leading-tight"
                onDoubleClick={() => editMode && setNameEditing(true)}
              >
                {feature.name}
              </h2>
              <ChevronDown
                size={16}
                className={`text-text-muted mt-1 flex-shrink-0 transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
              />
            </button>
          )}
          <p className="text-sm text-text-muted mt-1.5">{flows.length}플로우 · {screenCount}화면</p>
        </div>

        {editMode && (
          <div className="flex items-center gap-1 pt-1">
            <button className="btn-ghost text-xs gap-1 h-7 px-2" onClick={() => setAddingFlow(true)}>
              <Plus size={12} />플로우 추가
            </button>
            <button
              className="btn-ghost text-xs text-red-400 hover:bg-red-500/10 h-7 px-2"
              onClick={() => {
                if (confirm(`"${feature.name}" 기능과 모든 플로우/화면을 삭제할까요?`)) deleteFeature(feature.id)
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {open && (
        <div className="space-y-10 animate-fade-in">
          {editMode && addingFlow && (
            <div className="flex gap-2">
              <input
                value={newFlowName}
                onChange={e => setNewFlowName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createFlow(); if (e.key === 'Escape') setAddingFlow(false) }}
                placeholder="플로우 이름…"
                className="flex-1 h-8 text-sm"
                autoFocus
              />
              <button className="btn-primary text-xs" onClick={createFlow}>추가</button>
              <button className="btn-ghost text-xs" onClick={() => setAddingFlow(false)}>취소</button>
            </div>
          )}

          {flows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-text-muted">아직 플로우가 없습니다.</p>
            </div>
          ) : (
            flows.map(flow => {
              const screens = getScreensByFlow(flow.id)
              return (
                <div key={flow.id} className="group/flow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-base font-semibold text-text-primary">{flow.name}</span>
                    <span className="text-sm text-text-muted">{screens.length}화면</span>
                    <div className="flex-1 h-px bg-border/40" />
                    {/* Select all in flow */}
                    {(() => {
                      const flowIds = screens.map(s => s.id)
                      const allSelected = flowIds.length > 0 && flowIds.every(id => selectedIds.has(id))
                      return (
                        <button
                          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent opacity-0 group-hover/flow:opacity-100 transition-opacity px-2 py-1 rounded-md hover:bg-accent/10"
                          onClick={() => onSelectAllInFlow?.(flowIds)}
                          title={allSelected ? '선택 해제' : '전체 선택'}
                        >
                          {allSelected
                            ? <CheckSquare size={13} className="text-accent" />
                            : <Square size={13} />}
                          {allSelected ? '해제' : '전체선택'}
                        </button>
                      )
                    })()}
                    <button className="btn-ghost p-1.5 text-text-muted hover:text-text-primary opacity-0 group-hover/flow:opacity-100 transition-opacity">
                      <Bookmark size={14} />
                    </button>
                    <button className="btn-ghost p-1.5 text-text-muted hover:text-text-primary opacity-0 group-hover/flow:opacity-100 transition-opacity">
                      <Share2 size={14} />
                    </button>
                  </div>

                  <div
                    className="flow-scroll flex gap-6 overflow-x-auto pb-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
                  >
                    {screens.map((sc, i) => (
                      <ScreenThumb
                        key={sc.id}
                        screen={sc}
                        index={i}
                        total={screens.length}
                        onClick={() => openViewer(screens, i, `${feature.name} · ${flow.name}`)}
                        selectionMode={selectionMode}
                        selected={selectedIds.has(sc.id)}
                        onToggleSelect={() => onToggleSelect?.(sc.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {viewerScreens.length > 0 && !selectionMode && (
        <FlowViewer
          screens={viewerScreens}
          initialIndex={viewerIndex}
          onClose={() => setViewerScreens([])}
          title={viewerTitle}
        />
      )}
    </section>
  )
}
