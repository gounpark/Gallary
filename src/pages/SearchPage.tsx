import { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, AppWindow, FolderOpen, Play, Image } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useArchiveStore } from '@/store/archiveStore'
import { useImage } from '@/lib/useImage'

function SearchThumb({ id, filename }: { id: string; filename: string }) {
  const src = useImage(id)
  return (
    <div className="aspect-[9/16] rounded-lg overflow-hidden bg-bg-elevated">
      {src && <img src={src} alt={filename} className="w-full h-full object-cover" loading="lazy" />}
    </div>
  )
}

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const { searchQuery, setSearchQuery, searchScreens, apps, features, flows } = useArchiveStore()

  useEffect(() => {
    if (query) setSearchQuery(query)
  }, [query])

  const results = searchQuery ? searchScreens(searchQuery) : []

  const grouped = results.reduce<Record<string, typeof results>>((acc, sc) => {
    const key = sc.flowId
    if (!acc[key]) acc[key] = []
    acc[key].push(sc)
    return acc
  }, {})

  return (
    <AppLayout title="검색">
      <div className="px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Search size={16} className="text-text-muted" />
          <h1 className="text-sm font-semibold text-text-primary">
            {searchQuery
              ? `"${searchQuery}" 검색 결과 ${results.length}건`
              : '검색어를 입력하세요'}
          </h1>
        </div>

        {results.length === 0 && searchQuery && (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center">
            <Search size={32} className="text-text-muted opacity-30 mx-auto mb-3" />
            <p className="text-sm font-medium text-text-primary mb-1">검색 결과가 없습니다</p>
            <p className="text-xs text-text-muted">다른 검색어나 앱명, 기능명을 시도해보세요.</p>
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(grouped).map(([flowId, screens]) => {
            const flow = flows.find(f => f.id === flowId)
            const feature = features.find(f => f.id === flow?.featureId)
            const app = apps.find(a => a.id === flow?.appId)

            return (
              <div key={flowId} className="card overflow-hidden">
                {/* Group header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg-elevated/50">
                  <AppWindow size={13} className="text-text-muted" />
                  <span className="text-xs text-text-muted">{app?.name}</span>
                  <span className="text-text-muted/40">·</span>
                  <FolderOpen size={13} className="text-text-muted" />
                  <span className="text-xs text-text-muted">{feature?.name}</span>
                  <span className="text-text-muted/40">·</span>
                  <Play size={12} className="text-accent" />
                  <Link
                    to={`/app/${app?.id}/flow/${flowId}`}
                    className="text-xs text-accent hover:underline font-medium"
                  >
                    {flow?.name}
                  </Link>
                  <span className="ml-auto text-xs text-text-muted">{screens.length}개 매칭</span>
                </div>

                {/* Screens */}
                <div className="flex gap-3 p-3 overflow-x-auto">
                  {screens.map((sc, i) => (
                    <div key={sc.id} className="flex-shrink-0 w-24">
                      <SearchThumb id={sc.id} filename={sc.filename} />
                      <p className="text-[10px] text-text-muted mt-1 truncate text-center">
                        {sc.title ?? sc.filename}
                      </p>
                      {sc.memo && (
                        <p className="text-[10px] text-text-muted/70 mt-0.5 truncate text-center italic">
                          {sc.memo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
