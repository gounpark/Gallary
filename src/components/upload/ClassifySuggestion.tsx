import { useState } from 'react'
import { ChevronDown, ChevronRight, Check, X, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UploadedFile } from './DropZone'
import type { ClassifyGroup } from '@/lib/fileParser'
import { groupByParsed } from '@/lib/fileParser'
import { APP_COLORS } from '@/lib/utils'

export interface ClassifyResult {
  groups: Array<{
    appName: string
    appColor: string
    featureName: string
    flowName: string
    files: UploadedFile[]
  }>
}


interface ClassifySuggestionProps {
  files: UploadedFile[]
  onConfirm: (result: ClassifyResult) => void
  onReset: () => void
}

interface EditableGroup {
  appName: string
  appColor: string
  featureName: string
  flowName: string
  files: UploadedFile[]
  expanded: boolean
}

export function ClassifySuggestion({ files, onConfirm, onReset }: ClassifySuggestionProps) {
  const raw = groupByParsed(
    files.map(f => ({ ...f.parsed, imageData: f.imageData })),
  )

  const [groups, setGroups] = useState<EditableGroup[]>(() =>
    raw.map((g, i) => ({
      appName: g.appName,
      appColor: APP_COLORS[i % APP_COLORS.length],
      featureName: g.featureName,
      flowName: g.flowName || `${g.featureName} 플로우`,
      files: g.files.map(f => files.find(uf => uf.filename === f.filename)!).filter(Boolean),
      expanded: true,
    })),
  )

  const update = (i: number, patch: Partial<EditableGroup>) =>
    setGroups(gs => gs.map((g, idx) => (idx === i ? { ...g, ...patch } : g)))

  const handleConfirm = () => {
    onConfirm({ groups: groups.map(g => ({ ...g })) })
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">자동 분류 결과</h3>
          <p className="text-xs text-text-muted mt-0.5">
            파일명을 분석해 {groups.length}개 그룹으로 분류했습니다. 수정 후 확정하세요.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost text-xs" onClick={onReset}>다시 업로드</button>
          <button className="btn-primary text-xs" onClick={handleConfirm}>
            <Check size={13} />확정 & 저장
          </button>
        </div>
      </div>

      {groups.map((group, i) => (
        <div key={i} className="card overflow-hidden">
          {/* Group header */}
          <div
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-bg-elevated/50"
            onClick={() => update(i, { expanded: !group.expanded })}
          >
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: group.appColor }}
            />
            {group.expanded
              ? <ChevronDown size={14} className="text-text-muted" />
              : <ChevronRight size={14} className="text-text-muted" />}
            <span className="text-xs text-text-muted">{group.files.length}장</span>
          </div>

          {group.expanded && (
            <div className="px-3 pb-3 space-y-3 border-t border-border">
              {/* Editable fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">앱명</label>
                  <input
                    value={group.appName}
                    onChange={e => update(i, { appName: e.target.value })}
                    className="w-full h-8 text-sm"
                    placeholder="앱명"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">기능</label>
                  <input
                    value={group.featureName}
                    onChange={e => update(i, { featureName: e.target.value })}
                    className="w-full h-8 text-sm"
                    placeholder="기능명"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">플로우명</label>
                  <input
                    value={group.flowName}
                    onChange={e => update(i, { flowName: e.target.value })}
                    className="w-full h-8 text-sm"
                    placeholder="플로우명"
                  />
                </div>
              </div>

              {/* Preview strip */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {group.files.map((f, fi) => (
                  <div key={fi} className="flex-shrink-0 w-16">
                    <div className="aspect-[9/16] rounded-lg overflow-hidden bg-bg-elevated">
                      <img src={f.imageData} alt={f.filename} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] text-text-muted mt-1 truncate text-center">{fi + 1}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
