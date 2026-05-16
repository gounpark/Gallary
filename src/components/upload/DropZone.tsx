import { useCallback, useState } from 'react'
import { Upload, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { parseFilename } from '@/lib/fileParser'
import type { ParsedFilename } from '@/store/types'

export interface UploadedFile {
  filename: string
  imageData: string
  parsed: ParsedFilename
}

interface DropZoneProps {
  onFiles: (files: UploadedFile[]) => void
}

export function DropZone({ onFiles }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter(f => f.type.startsWith('image/'))
      if (files.length === 0) return

      setLoading(true)
      const results: UploadedFile[] = await Promise.all(
        files.map(
          file =>
            new Promise<UploadedFile>(resolve => {
              const reader = new FileReader()
              reader.onload = () => {
                resolve({
                  filename: file.name,
                  imageData: reader.result as string,
                  parsed: parseFilename(file.name),
                })
              }
              reader.readAsDataURL(file)
            }),
        ),
      )
      setLoading(false)
      onFiles(results)
    },
    [onFiles],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      processFiles(e.dataTransfer.files)
    },
    [processFiles],
  )

  return (
    <label
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-all',
        dragging
          ? 'border-accent bg-accent-light'
          : 'border-border hover:border-accent/50 hover:bg-bg-elevated',
      )}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={e => e.target.files && processFiles(e.target.files)}
      />
      {loading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-muted">이미지 읽는 중…</p>
        </div>
      ) : (
        <>
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
            dragging ? 'bg-accent text-white' : 'bg-bg-elevated text-text-muted',
          )}>
            {dragging ? <ImagePlus size={28} /> : <Upload size={28} />}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">
              {dragging ? '여기에 놓기' : '이미지를 드래그하거나 클릭하여 업로드'}
            </p>
            <p className="text-xs text-text-muted mt-1">
              PNG, JPG, WEBP, GIF · 여러 장 한번에 가능
            </p>
          </div>
          <p className="text-xs text-text-muted bg-bg-elevated px-3 py-1.5 rounded-full">
            파일명 규칙 예: <code className="text-accent">orix_search_01.png</code>
          </p>
        </>
      )}
    </label>
  )
}
