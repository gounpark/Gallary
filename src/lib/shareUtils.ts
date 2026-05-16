export function buildShareUrl(shareId: string): string {
  const base = window.location.origin + window.location.pathname
  return `${base}#/share/${shareId}`
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
