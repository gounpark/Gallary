import { getImageUrl } from './imageStorage'

export function useImage(screenId: string): string | undefined {
  if (!screenId) return undefined
  return getImageUrl(screenId)
}
