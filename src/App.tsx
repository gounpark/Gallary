import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { AppDetailPage } from '@/pages/AppDetailPage'
import { FlowDetailPage } from '@/pages/FlowDetailPage'
import { UploadPage } from '@/pages/UploadPage'
import { SearchPage } from '@/pages/SearchPage'
import { SharePage } from '@/pages/SharePage'
import { useArchiveStore } from '@/store/archiveStore'

function DataLoader({ children }: { children: React.ReactNode }) {
  const loadFromSupabase = useArchiveStore(s => s.loadFromSupabase)
  useEffect(() => {
    loadFromSupabase()
  }, [])
  return <>{children}</>
}

export function App() {
  return (
    <HashRouter>
      <DataLoader>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/app/:appId" element={<AppDetailPage />} />
          <Route path="/app/:appId/flow/:flowId" element={<FlowDetailPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/share/:shareId" element={<SharePage />} />
        </Routes>
      </DataLoader>
    </HashRouter>
  )
}
