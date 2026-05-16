import JSZip from 'jszip'
import { getImageUrl } from './imageStorage'
import type { Screen } from '@/store/types'

async function fetchBlob(url: string): Promise<Blob> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return res.blob()
}

async function toPng(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('canvas toBlob failed')), 'image/png')
      URL.revokeObjectURL(img.src)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(blob)
  })
}

export async function copyScreenToClipboard(screenId: string): Promise<void> {
  const url = getImageUrl(screenId)
  if (!url) throw new Error('No image URL')
  const blob = await fetchBlob(url)
  const png = await toPng(blob)
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })])
}

export async function downloadScreensAsZip(screens: Screen[], zipName = 'screens'): Promise<void> {
  const zip = new JSZip()
  await Promise.all(
    screens.map(async (sc, i) => {
      const url = getImageUrl(sc.id)
      if (!url) return
      const blob = await fetchBlob(url)
      const name = `${String(i + 1).padStart(2, '0')}_${sc.filename ?? sc.id}.jpg`
      zip.file(name, blob)
    })
  )
  const content = await zip.generateAsync({ type: 'blob' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(content)
  a.download = `${zipName}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(a.href)
}
