import { useState } from 'react'
import { Share2, Copy, Check, X, Link2, AppWindow, FolderOpen, Play, Images } from 'lucide-react'
import { useArchiveStore } from '@/store/archiveStore'
import { buildShareUrl, copyToClipboard } from '@/lib/shareUtils'
import { cn } from '@/lib/utils'
import type { ShareLink } from '@/store/types'

type ShareType = ShareLink['type']

interface ShareModalProps {
  defaultType?: ShareType
  defaultTargetId?: string
  onClose: () => void
}

const TYPE_LABELS: Record<ShareType, { label: string; icon: React.ReactNode }> = {
  app: { label: '앱 전체', icon: <AppWindow size={15} /> },
  feature: { label: '기능', icon: <FolderOpen size={15} /> },
  flow: { label: '플로우', icon: <Play size={15} /> },
  custom: { label: '선택 화면', icon: <Images size={15} /> },
}

export function ShareModal({ defaultType = 'flow', defaultTargetId = '', onClose }: ShareModalProps) {
  const { apps, features, flows, screens, generateShareLink, shareLinks } = useArchiveStore()
  const [shareType, setShareType] = useState<ShareType>(defaultType)
  const [targetId, setTargetId] = useState(defaultTargetId)
  const [label, setLabel] = useState('')
  const [copied, setCopied] = useState(false)
  const [generated, setGenerated] = useState<ShareLink | null>(null)

  const handleGenerate = () => {
    if (!targetId) return
    const link = generateShareLink({ type: shareType, targetId, label: label || undefined })
    setGenerated(link)
  }

  const handleCopy = async () => {
    if (!generated) return
    const url = buildShareUrl(generated.id)
    const ok = await copyToClipboard(url)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getTargetOptions = () => {
    switch (shareType) {
      case 'app': return apps.map(a => ({ id: a.id, label: a.name }))
      case 'feature': return features.map(f => {
        const app = apps.find(a => a.id === f.appId)
        return { id: f.id, label: `${app?.name} / ${f.name}` }
      })
      case 'flow': return flows.map(f => {
        const feat = features.find(ft => ft.id === f.featureId)
        const app = apps.find(a => a.id === f.appId)
        return { id: f.id, label: `${app?.name} / ${feat?.name} / ${f.name}` }
      })
      case 'custom': return []
    }
  }

  const existingLinks = shareLinks.filter(l => l.targetId === targetId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-text-primary">공유 링크 만들기</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Share type */}
          <div>
            <label className="text-xs text-text-muted mb-2 block">공유 범위</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(TYPE_LABELS) as ShareType[]).map(type => (
                <button
                  key={type}
                  onClick={() => { setShareType(type); setTargetId('') }}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all',
                    shareType === type
                      ? 'border-accent bg-accent-light text-accent'
                      : 'border-border text-text-muted hover:border-accent/40',
                  )}
                >
                  {TYPE_LABELS[type].icon}
                  {TYPE_LABELS[type].label}
                </button>
              ))}
            </div>
          </div>

          {/* Target selector */}
          {shareType !== 'custom' && (
            <div>
              <label className="text-xs text-text-muted mb-1 block">대상 선택</label>
              <select
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                className="w-full h-9 text-sm"
              >
                <option value="">선택하세요…</option>
                {getTargetOptions().map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Label */}
          <div>
            <label className="text-xs text-text-muted mb-1 block">링크 메모 (선택)</label>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="예: 디자이너 리뷰용, 클라이언트 공유용"
              className="w-full h-9 text-sm"
            />
          </div>

          {/* Existing links */}
          {existingLinks.length > 0 && (
            <div>
              <p className="text-xs text-text-muted mb-1">기존 링크</p>
              <div className="space-y-1">
                {existingLinks.map(link => (
                  <div key={link.id} className="flex items-center gap-2 text-xs bg-bg-elevated rounded-lg px-3 py-2">
                    <Link2 size={12} className="text-text-muted" />
                    <span className="flex-1 truncate text-text-secondary font-mono">
                      {buildShareUrl(link.id)}
                    </span>
                    <button
                      onClick={async () => {
                        await copyToClipboard(buildShareUrl(link.id))
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="text-accent hover:underline"
                    >
                      복사
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated link */}
          {generated && (
            <div className="bg-accent-light border border-accent/30 rounded-xl p-3 space-y-2">
              <p className="text-xs font-medium text-accent">링크가 생성되었습니다!</p>
              <div className="flex items-center gap-2 bg-bg-base rounded-lg px-3 py-2">
                <span className="flex-1 text-xs text-text-muted font-mono truncate">
                  {buildShareUrl(generated.id)}
                </span>
                <button onClick={handleCopy} className="btn-primary h-7 text-xs gap-1">
                  {copied ? <><Check size={12} />복사됨</> : <><Copy size={12} />복사</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-border">
          <button onClick={onClose} className="btn-ghost flex-1 text-sm">닫기</button>
          {!generated && (
            <button
              onClick={handleGenerate}
              disabled={!targetId && shareType !== 'custom'}
              className="btn-primary flex-1 text-sm disabled:opacity-40"
            >
              <Link2 size={14} />링크 생성
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
