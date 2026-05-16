import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Upload, Layers } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { AppCard } from '@/components/archive/AppCard'
import { useArchiveStore } from '@/store/archiveStore'

export function HomePage() {
  const navigate = useNavigate()
  const { apps, screens, flows } = useArchiveStore()

  return (
    <AppLayout title="전체 아카이브">
      <div style={{ padding: 'clamp(24px, 4vw, 64px)' }}>
        {/* Stats */}
        <div className="hidden sm:grid grid-cols-3 gap-4 mb-8">
          {[
            { label: '앱', value: apps.length, icon: <LayoutGrid size={16} /> },
            { label: '플로우', value: flows.length, icon: <Layers size={16} /> },
            { label: '화면', value: screens.length, icon: <Upload size={16} /> },
          ].map(stat => (
            <div key={stat.label} className="card p-5 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-accent-light flex items-center justify-center text-accent flex-shrink-0">
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-text-primary leading-none">{stat.value}</p>
                <p className="text-sm text-text-muted mt-1.5 whitespace-nowrap">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Apps grid */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-text-primary">앱 목록</h2>
        </div>

        {apps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-14 text-center">
            <div className="w-14 h-14 rounded-xl bg-bg-elevated flex items-center justify-center mx-auto mb-4">
              <LayoutGrid size={26} className="text-text-muted opacity-30" />
            </div>
            <p className="text-sm font-semibold text-text-primary mb-1.5">아직 앱이 없습니다</p>
            <p className="text-xs text-text-muted mb-4">화면 캡처를 업로드해보세요.</p>
            <button className="btn btn-outline" onClick={() => navigate('/upload')}>
              <Upload size={13} />업로드
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" style={{ columnGap: 'clamp(12px, 2vw, 40px)', rowGap: 'clamp(24px, 4vw, 64px)' }}>
            {apps.map(app => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
