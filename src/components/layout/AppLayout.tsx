import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  headerActions?: React.ReactNode
  hideUploadOnMobile?: boolean
  appId?: string
  selectedFlowId?: string | null
}

export function AppLayout({ children, title, headerActions, hideUploadOnMobile, appId, selectedFlowId }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-dvh overflow-hidden bg-bg-base">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-border overflow-hidden">
        <Sidebar appId={appId} selectedFlowId={selectedFlowId} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 z-50 shadow-2xl">
            <Sidebar appId={appId} selectedFlowId={selectedFlowId} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          actions={headerActions}
          hideUploadOnMobile={hideUploadOnMobile}
        />
        <main className={cn('flex-1 overflow-y-auto')}>
          {children}
        </main>
      </div>
    </div>
  )
}
