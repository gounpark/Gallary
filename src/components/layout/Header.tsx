import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu, Upload, X } from 'lucide-react'
import { useArchiveStore } from '@/store/archiveStore'
import logoSvg from '@/assets/logo.svg'

interface HeaderProps {
  onMenuClick?: () => void
  title?: string
  actions?: React.ReactNode
  hideUploadOnMobile?: boolean
}

export function Header({ onMenuClick, title, actions, hideUploadOnMobile }: HeaderProps) {
  const navigate = useNavigate()
  const { searchQuery, setSearchQuery } = useArchiveStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 h-16 bg-bg-base/90 backdrop-blur border-b border-border">
      {/* Mobile menu */}
      {onMenuClick && (
        <button onClick={onMenuClick} className="btn-ghost p-1.5 lg:hidden">
          <Menu size={16} />
        </button>
      )}

      {/* Logo (mobile only — desktop shows in sidebar) */}
      <Link to="/" className="lg:hidden flex-shrink-0">
        <img src={logoSvg} alt="Gallary" style={{ height: 'clamp(24px, 2.2vw, 32px)' }} />
      </Link>

      {/* Search — full bar on desktop, icon only on mobile */}
      <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          ref={inputRef}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="앱, 기능, 플로우 검색…"
          className="w-full pl-9 pr-8 h-9 text-sm bg-bg-elevated border-border"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            <X size={13} />
          </button>
        )}
      </form>

      {/* Mobile search icon */}
      <button
        className="sm:hidden btn-ghost p-2"
        onClick={() => navigate('/search')}
      >
        <Search size={18} />
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <div className={hideUploadOnMobile ? 'hidden sm:flex items-center gap-2' : 'flex items-center gap-2'}>
          {actions}
        </div>
        <button
          onClick={() => navigate('/upload')}
          className={`btn btn-primary${hideUploadOnMobile ? ' hidden sm:flex' : ''}`}
        >
          <Upload size={13} />
          <span className="hidden sm:inline">업로드</span>
        </button>
      </div>
    </header>
  )
}
