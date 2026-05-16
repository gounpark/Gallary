import type { ParsedFilename } from '../store/types'

const EXT_PATTERN = /\.[^.]+$/
// date segment: YYYYMMDD or YYYYMMDD-N
const DATE_SEGMENT = /^\d{8}(-\d+)?$/

function decode(s: string) {
  return s.replace(/\+/g, ' ').trim()
}

/**
 * 지원 형식:
 *   앱명_기능(-서브기능(-세부기능))_날짜(-순서).ext
 *   예) How+We+Feel_탐색-툴-이모션101_20251222-2.png
 *       orix_search_01.png  (기존 단순 형식도 계속 지원)
 */
export function parseFilename(filename: string): ParsedFilename {
  const noExt = filename.replace(EXT_PATTERN, '')
  const segments = noExt.split('_')

  // ── 새 형식: 3개 세그먼트이고 마지막이 날짜 패턴 ──────────────────
  if (segments.length >= 3 && DATE_SEGMENT.test(segments[segments.length - 1])) {
    const appPart = segments.slice(0, segments.length - 2).join('_')
    const featurePart = segments[segments.length - 2]
    const datePart = segments[segments.length - 1]

    const appName = decode(appPart)

    const featureHierarchy = featurePart.split('-').map(decode)
    const featureName = featureHierarchy[0] || 'default'
    const flowName =
      featureHierarchy.length > 1
        ? featureHierarchy.slice(1).join(' · ')
        : featureName

    // 순서: 날짜-N 에서 N 그대로 사용 (1부터 시작), 숫자 없으면 0
    const orderMatch = datePart.match(/-(\d+)$/)
    const order = orderMatch ? parseInt(orderMatch[1], 10) : 0

    return { appName: appName || 'untitled', featureName, flowName, order, raw: filename }
  }

  // ── 기존 단순 형식: 앱명_기능명_순서.ext ─────────────────────────
  const parts = noExt.split(/[_\-\s]+/).filter(Boolean)
  if (parts.length === 0) return { appName: 'untitled', featureName: 'default', flowName: 'default', order: 0, raw: filename }

  const last = parts[parts.length - 1]
  const hasOrder = /^\d+$/.test(last)
  const order = hasOrder ? parseInt(last, 10) - 1 : 0
  const appName = decode(parts[0]) || 'untitled'
  const middle = hasOrder ? parts.slice(1, -1) : parts.slice(1)
  const featureName = middle.map(decode).join(' ') || 'default'

  return { appName, featureName, flowName: featureName, order, raw: filename }
}

export interface ClassifyGroup {
  appName: string
  featureName: string
  flowName: string
  files: Array<{ filename: string; order: number; imageData: string }>
}

export function groupByParsed(
  parsed: Array<ParsedFilename & { imageData: string }>,
): ClassifyGroup[] {
  const map = new Map<string, ClassifyGroup>()

  for (const item of parsed) {
    // 앱+기능+플로우 조합을 키로 사용
    const key = `${item.appName}|||${item.featureName}|||${item.flowName}`
    if (!map.has(key)) {
      map.set(key, {
        appName: item.appName,
        featureName: item.featureName,
        flowName: item.flowName,
        files: [],
      })
    }
    map.get(key)!.files.push({
      filename: item.raw,
      order: item.order,
      imageData: item.imageData,
    })
  }

  for (const group of map.values()) {
    group.files.sort((a, b) => a.order - b.order)
    group.files.forEach((f, i) => (f.order = i))
  }

  return [...map.values()]
}
