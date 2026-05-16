import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, ChevronRight, ChevronDown, Upload,
  Search, Hash, FolderOpen, X, Layers, Tag, Play,
} from 'lucide-react'
import logoSvg from '@/assets/logo.svg'
import { useArchiveStore } from '@/store/archiveStore'
import { cn } from '@/lib/utils'

interface SidebarProps {
  onClose?: () => void
  appId?: string
  selectedFlowId?: string | null
}

export function Sidebar({ onClose, appId, selectedFlowId }: SidebarProps) {
  const navigate = useNavigate()
  const {
    apps, features, flows,
    selectedAppId, selectedFeatureId,
    selectedTags, selectedUiPatterns, selectedCategories, searchQuery,
    setSelectedApp, setSelectedFeature,
    toggleTag, toggleUiPattern, toggleCategory, getAllTags,
    getFeaturesByApp, getScreenCount, getFlowsByFeature,
    getUiPatterns, getCategories,
  } = useArchiveStore()

  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set())
  const [patternsExpanded, setPatternsExpanded] = useState(true)
  const [categoriesExpanded, setCategoriesExpanded] = useState(true)

  const isDetailView = !!appId
  const detailApp = appId ? apps.find(a => a.id === appId) : null
  const detailFeatures = appId ? getFeaturesByApp(appId) : []
  const detailFlows = appId ? detailFeatures.flatMap(f => getFlowsByFeature(f.id)) : []

  const toggleApp = (id: string) => {
    setExpandedApps(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSelectApp = (appId: string) => {
    setSelectedApp(appId)
    navigate(`/app/${appId}`)
    onClose?.()
  }

  const handleSelectFeature = (appId: string, featureId: string) => {
    setSelectedApp(appId)
    setSelectedFeature(featureId)
    navigate(`/app/${appId}?feature=${featureId}`)
    onClose?.()
  }

  const allTags = getAllTags()
  const uiPatterns = getUiPatterns()
  const categories = getCategories()

  return (
    <aside className="flex flex-col h-full w-full bg-bg-sidebar select-none">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-border flex-shrink-0">
        <Link to="/" onClick={onClose}>
          <img src={logoSvg} alt="Gallary" style={{ height: 'clamp(24px, 2.2vw, 32px)' }} />
        </Link>
        {onClose && (
          <button onClick={onClose} className="btn-ghost p-1">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Quick nav */}
      <div className="px-3 pt-3 pb-2 space-y-1">
        <Link
          to="/"
          className={cn('sidebar-item', !selectedAppId && !searchQuery && 'active')}
          onClick={() => { setSelectedApp(null); onClose?.() }}
        >
          <LayoutGrid size={15} />
          <span>전체 아카이브</span>
        </Link>
        <Link
          to="/upload"
          className="sidebar-item"
          onClick={onClose}
        >
          <Upload size={15} />
          <span>업로드</span>
        </Link>
        <Link
          to="/search"
          className="sidebar-item"
          onClick={onClose}
        >
          <Search size={15} />
          <span>검색</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pt-2 pb-6 space-y-5">
        {/* Detail view: Flows list */}
        {isDetailView && detailApp ? (
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: detailApp.color }}
              />
              <span className="section-title truncate">{detailApp.name}</span>
            </div>

            {detailFlows.length === 0 ? (
              <p className="text-xs text-text-muted px-2 py-2">플로우가 없습니다.</p>
            ) : (
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    navigate(`/app/${appId}`)
                    onClose?.()
                  }}
                  className={cn(
                    'sidebar-item w-full text-left text-xs',
                    !selectedFlowId && 'active',
                  )}
                >
                  <span className="flex-1 truncate">모든 플로우</span>
                </button>
                {detailFlows.map(flow => (
                  <button
                    key={flow.id}
                    onClick={() => {
                      navigate(`/app/${appId}?flow=${flow.id}`)
                      onClose?.()
                    }}
                    className={cn(
                      'sidebar-item w-full text-left text-xs',
                      selectedFlowId === flow.id && 'active',
                    )}
                  >
                    <Play size={11} className="flex-shrink-0" />
                    <span className="flex-1 truncate">{flow.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default view: Apps tree */
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="section-title">앱</span>
            </div>

            {apps.length === 0 && (
              <p className="text-xs text-text-muted px-2 py-2">아직 앱이 없습니다.</p>
            )}

            <div className="space-y-0.5">
            {apps.map(app => {
              const appFeatures = getFeaturesByApp(app.id)
              const isExpanded = expandedApps.has(app.id)
              const isActive = selectedAppId === app.id

              return (
                <div key={app.id}>
                  <div
                    className={cn('sidebar-item group', isActive && 'active')}
                    onClick={() => handleSelectApp(app.id)}
                  >
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: app.color }}
                    />
                    <span className="flex-1 truncate">{app.name}</span>
                    <span className="text-xs text-text-muted">{appFeatures.length}</span>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => { e.stopPropagation(); toggleApp(app.id) }}
                    >
                      {isExpanded
                        ? <ChevronDown size={13} />
                        : <ChevronRight size={13} />}
                    </button>
                  </div>

                  {isExpanded && appFeatures.map(feat => {
                    const isFeatActive = selectedFeatureId === feat.id

                    return (
                      <div key={feat.id} className="ml-4">
                        <div
                          className={cn('sidebar-item group text-xs', isFeatActive && 'active')}
                          onClick={() => handleSelectFeature(app.id, feat.id)}
                        >
                          <FolderOpen size={13} className="flex-shrink-0" />
                          <span className="flex-1 truncate">{feat.name}</span>
                          <span className="text-xs text-text-muted">{getScreenCount(feat.id)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
            </div>
          </div>
        )}

        {/* UI 패턴 */}
        {uiPatterns.length > 0 && (
          <div>
            <button
              className="flex items-center justify-between w-full px-1 mb-2 group"
              onClick={() => setPatternsExpanded(v => !v)}
            >
              <div className="flex items-center gap-1.5">
                <Layers size={12} className="text-text-muted" />
                <span className="section-title">UI 패턴</span>
              </div>
              {patternsExpanded
                ? <ChevronDown size={12} className="text-text-muted" />
                : <ChevronRight size={12} className="text-text-muted" />}
            </button>
            {patternsExpanded && (
              <div className="space-y-0.5">
                {uiPatterns.map(({ name, count }) => (
                  <button
                    key={name}
                    onClick={() => toggleUiPattern(name)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors',
                      selectedUiPatterns.includes(name)
                        ? 'bg-accent-light text-accent'
                        : 'text-text-secondary hover:bg-bg-card hover:text-text-primary',
                    )}
                  >
                    <span
                      className={cn(
                        'w-3.5 h-3.5 rounded flex-shrink-0 border flex items-center justify-center transition-colors',
                        selectedUiPatterns.includes(name)
                          ? 'bg-accent border-accent'
                          : 'border-border',
                      )}
                    >
                      {selectedUiPatterns.includes(name) && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="flex-1 text-[13px] truncate">{name}</span>
                    <span className="text-[11px] text-text-muted tabular-nums">{count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 카테고리 유형 */}
        {categories.length > 0 && (
          <div>
            <button
              className="flex items-center justify-between w-full px-1 mb-2 group"
              onClick={() => setCategoriesExpanded(v => !v)}
            >
              <div className="flex items-center gap-1.5">
                <Tag size={12} className="text-text-muted" />
                <span className="section-title">카테고리 유형</span>
              </div>
              {categoriesExpanded
                ? <ChevronDown size={12} className="text-text-muted" />
                : <ChevronRight size={12} className="text-text-muted" />}
            </button>
            {categoriesExpanded && (
              <div className="space-y-0.5">
                {categories.map(({ name, count }) => (
                  <button
                    key={name}
                    onClick={() => toggleCategory(name)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors',
                      selectedCategories.includes(name)
                        ? 'bg-accent-light text-accent'
                        : 'text-text-secondary hover:bg-bg-card hover:text-text-primary',
                    )}
                  >
                    <span
                      className={cn(
                        'w-3.5 h-3.5 rounded flex-shrink-0 border flex items-center justify-center transition-colors',
                        selectedCategories.includes(name)
                          ? 'bg-accent border-accent'
                          : 'border-border',
                      )}
                    >
                      {selectedCategories.includes(name) && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="flex-1 text-[13px] truncate">{name}</span>
                    <span className="text-[11px] text-text-muted tabular-nums">{count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {allTags.length > 0 && (
          <div>
            <div className="section-title px-1 mb-1">태그</div>
            <div className="flex flex-wrap gap-1 px-1">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'tag cursor-pointer transition-colors',
                    selectedTags.includes(tag) && 'bg-accent-light border-accent text-accent',
                  )}
                >
                  <Hash size={10} className="mr-0.5" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
