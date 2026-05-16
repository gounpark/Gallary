import { supabase } from './supabase'

const BUCKET = 'images'

function compress(dataUrl: string, maxWidth = 1200): Promise<Blob> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.82)
    }
    img.src = dataUrl
  })
}

export async function saveImage(id: string, dataUrl: string): Promise<void> {
  const blob = await compress(dataUrl)
  await supabase.storage.from(BUCKET).upload(`${id}.jpg`, blob, {
    contentType: 'image/jpeg',
    upsert: true,
  })
}

export function getImageUrl(id: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${id}.jpg`
}

export async function deleteImages(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  await supabase.storage.from(BUCKET).remove(ids.map(id => `${id}.jpg`))
}
