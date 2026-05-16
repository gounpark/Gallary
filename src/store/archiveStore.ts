import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { App, Feature, Flow, Screen, ShareLink, FilterState } from './types'
import { deleteImages } from '../lib/imageStorage'

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// DB row → TypeScript
const toApp = (r: Record<string, unknown>): App => ({
  id: r.id as string, name: r.name as string, description: r.description as string | undefined,
  color: r.color as string, icon: r.icon as string | undefined, category: r.category as string | undefined,
  createdAt: r.created_at as string,
})
const toFeature = (r: Record<string, unknown>): Feature => ({
  id: r.id as string, appId: r.app_id as string, name: r.name as string,
  description: r.description as string | undefined, order: r.order as number,
})
const toFlow = (r: Record<string, unknown>): Flow => ({
  id: r.id as string, appId: r.app_id as string, featureId: r.feature_id as string,
  name: r.name as string, description: r.description as string | undefined,
  tags: (r.tags as string[]) ?? [], order: r.order as number,
})
const toScreen = (r: Record<string, unknown>): Screen => ({
  id: r.id as string, appId: r.app_id as string, featureId: r.feature_id as string,
  flowId: r.flow_id as string, filename: r.filename as string, title: r.title as string | undefined,
  memo: r.memo as string | undefined, order: r.order as number, tags: (r.tags as string[]) ?? [],
})
const toShareLink = (r: Record<string, unknown>): ShareLink => ({
  id: r.id as string, type: r.type as ShareLink['type'], targetId: r.target_id as string,
  screenIds: r.screen_ids as string[] | undefined, label: r.label as string | undefined,
  createdAt: r.created_at as string,
})

interface ArchiveState extends FilterState {
  apps: App[]
  features: Feature[]
  flows: Flow[]
  screens: Screen[]
  shareLinks: ShareLink[]
  isLoading: boolean

  loadFromSupabase: () => Promise<void>

  addApp: (data: Omit<App, 'id' | 'createdAt'>) => App
  updateApp: (id: string, data: Partial<App>) => void
  deleteApp: (id: string) => void

  addFeature: (data: Omit<Feature, 'id' | 'order'>) => Feature
  updateFeature: (id: string, data: Partial<Feature>) => void
  deleteFeature: (id: string) => void
  reorderFeatures: (appId: string, orderedIds: string[]) => void

  addFlow: (data: Omit<Flow, 'id' | 'order'>) => Flow
  updateFlow: (id: string, data: Partial<Flow>) => void
  deleteFlow: (id: string) => void
  reorderFlows: (featureId: string, orderedIds: string[]) => void

  addScreens: (screens: (Omit<Screen, 'id'> & { imageData?: string })[]) => Screen[]
  updateScreen: (id: string, data: Partial<Screen>) => void
  deleteScreen: (id: string) => void
  reorderScreens: (flowId: string, orderedIds: string[]) => void
  moveScreen: (screenId: string, targetFlowId: string) => void

  generateShareLink: (data: Omit<ShareLink, 'id' | 'createdAt'>) => ShareLink
  deleteShareLink: (id: string) => void

  setSelectedApp: (id: string | null) => void
  setSelectedFeature: (id: string | null) => void
  setSelectedFlow: (id: string | null) => void
  setSearchQuery: (q: string) => void
  toggleTag: (tag: string) => void
  toggleUiPattern: (pattern: string) => void
  toggleCategory: (category: string) => void

  getFeaturesByApp: (appId: string) => Feature[]
  getFlowsByFeature: (featureId: string) => Flow[]
  getScreensByFlow: (flowId: string) => Screen[]
  getScreenCount: (featureId: string) => number
  getAllTags: () => string[]
  getUiPatterns: () => { name: string; count: number }[]
  getCategories: () => { name: string; count: number }[]
  searchScreens: (query: string) => Screen[]
}

export const useArchiveStore = create<ArchiveState>()((set, get) => ({
  apps: [],
  features: [],
  flows: [],
  screens: [],
  shareLinks: [],
  isLoading: false,

  selectedAppId: null,
  selectedFeatureId: null,
  selectedFlowId: null,
  selectedTags: [],
  selectedUiPatterns: [],
  selectedCategories: [],
  searchQuery: '',

  async loadFromSupabase() {
    set({ isLoading: true })
    const [a, f, fl, sc, sl] = await Promise.all([
      supabase.from('apps').select('*'),
      supabase.from('features').select('*'),
      supabase.from('flows').select('*'),
      supabase.from('screens').select('*'),
      supabase.from('share_links').select('*'),
    ])
    set({
      apps: (a.data ?? []).map(toApp),
      features: (f.data ?? []).map(toFeature),
      flows: (fl.data ?? []).map(toFlow),
      screens: (sc.data ?? []).map(toScreen),
      shareLinks: (sl.data ?? []).map(toShareLink),
      isLoading: false,
    })
  },

  // ── App ──────────────────────────────────────────────────
  addApp(data) {
    const app: App = { ...data, id: uid(), createdAt: new Date().toISOString() }
    set(s => ({ apps: [...s.apps, app] }))
    supabase.from('apps').insert({
      id: app.id, name: app.name, description: app.description,
      color: app.color, icon: app.icon, category: app.category, created_at: app.createdAt,
    })
    return app
  },
  updateApp(id, data) {
    set(s => ({ apps: s.apps.map(a => a.id === id ? { ...a, ...data } : a) }))
    supabase.from('apps').update({
      name: data.name, description: data.description, color: data.color,
      icon: data.icon, category: data.category,
    }).eq('id', id)
  },
  deleteApp(id) {
    const featureIds = get().features.filter(f => f.appId === id).map(f => f.id)
    const flowIds = get().flows.filter(f => featureIds.includes(f.featureId)).map(f => f.id)
    const screenIds = get().screens.filter(sc => flowIds.includes(sc.flowId)).map(sc => sc.id)
    deleteImages(screenIds)
    set(s => ({
      apps: s.apps.filter(a => a.id !== id),
      features: s.features.filter(f => f.appId !== id),
      flows: s.flows.filter(f => !featureIds.includes(f.featureId)),
      screens: s.screens.filter(sc => !flowIds.includes(sc.flowId)),
    }))
    if (screenIds.length) supabase.from('screens').delete().in('id', screenIds)
    if (flowIds.length) supabase.from('flows').delete().in('id', flowIds)
    if (featureIds.length) supabase.from('features').delete().in('id', featureIds)
    supabase.from('apps').delete().eq('id', id)
  },

  // ── Feature ──────────────────────────────────────────────
  addFeature(data) {
    const existing = get().features.filter(f => f.appId === data.appId)
    const feature: Feature = { ...data, id: uid(), order: existing.length }
    set(s => ({ features: [...s.features, feature] }))
    supabase.from('features').insert({
      id: feature.id, app_id: feature.appId, name: feature.name,
      description: feature.description, order: feature.order,
    })
    return feature
  },
  updateFeature(id, data) {
    set(s => ({ features: s.features.map(f => f.id === id ? { ...f, ...data } : f) }))
    supabase.from('features').update({ name: data.name, description: data.description }).eq('id', id)
  },
  deleteFeature(id) {
    const flowIds = get().flows.filter(f => f.featureId === id).map(f => f.id)
    const screenIds = get().screens.filter(sc => flowIds.includes(sc.flowId)).map(sc => sc.id)
    deleteImages(screenIds)
    set(s => ({
      features: s.features.filter(f => f.id !== id),
      flows: s.flows.filter(f => f.featureId !== id),
      screens: s.screens.filter(sc => !flowIds.includes(sc.flowId)),
    }))
    if (screenIds.length) supabase.from('screens').delete().in('id', screenIds)
    if (flowIds.length) supabase.from('flows').delete().in('id', flowIds)
    supabase.from('features').delete().eq('id', id)
  },
  reorderFeatures(appId, orderedIds) {
    set(s => ({
      features: s.features.map(f =>
        f.appId === appId ? { ...f, order: orderedIds.indexOf(f.id) } : f,
      ),
    }))
    orderedIds.forEach((id, idx) => supabase.from('features').update({ order: idx }).eq('id', id))
  },

  // ── Flow ─────────────────────────────────────────────────
  addFlow(data) {
    const existing = get().flows.filter(f => f.featureId === data.featureId)
    const flow: Flow = { ...data, id: uid(), order: existing.length }
    set(s => ({ flows: [...s.flows, flow] }))
    supabase.from('flows').insert({
      id: flow.id, app_id: flow.appId, feature_id: flow.featureId,
      name: flow.name, description: flow.description, tags: flow.tags, order: flow.order,
    })
    return flow
  },
  updateFlow(id, data) {
    set(s => ({ flows: s.flows.map(f => f.id === id ? { ...f, ...data } : f) }))
    supabase.from('flows').update({
      name: data.name, description: data.description, tags: data.tags,
    }).eq('id', id)
  },
  deleteFlow(id) {
    const screenIds = get().screens.filter(sc => sc.flowId === id).map(sc => sc.id)
    deleteImages(screenIds)
    set(s => ({
      flows: s.flows.filter(f => f.id !== id),
      screens: s.screens.filter(sc => sc.flowId !== id),
    }))
    if (screenIds.length) supabase.from('screens').delete().in('id', screenIds)
    supabase.from('flows').delete().eq('id', id)
  },
  reorderFlows(featureId, orderedIds) {
    set(s => ({
      flows: s.flows.map(f =>
        f.featureId === featureId ? { ...f, order: orderedIds.indexOf(f.id) } : f,
      ),
    }))
    orderedIds.forEach((id, idx) => supabase.from('flows').update({ order: idx }).eq('id', id))
  },

  // ── Screen ───────────────────────────────────────────────
  addScreens(items) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const newScreens: Screen[] = items.map(({ imageData: _img, ...item }) => ({ ...item, id: uid() }))
    set(s => ({ screens: [...s.screens, ...newScreens] }))
    supabase.from('screens').insert(
      newScreens.map(sc => ({
        id: sc.id, app_id: sc.appId, feature_id: sc.featureId, flow_id: sc.flowId,
        filename: sc.filename, title: sc.title, memo: sc.memo, order: sc.order, tags: sc.tags,
      })),
    )
    return newScreens
  },
  updateScreen(id, data) {
    set(s => ({ screens: s.screens.map(sc => sc.id === id ? { ...sc, ...data } : sc) }))
    supabase.from('screens').update({
      title: data.title, memo: data.memo, tags: data.tags, order: data.order,
    }).eq('id', id)
  },
  deleteScreen(id) {
    deleteImages([id])
    set(s => ({ screens: s.screens.filter(sc => sc.id !== id) }))
    supabase.from('screens').delete().eq('id', id)
  },
  reorderScreens(flowId, orderedIds) {
    set(s => ({
      screens: s.screens.map(sc =>
        sc.flowId === flowId ? { ...sc, order: orderedIds.indexOf(sc.id) } : sc,
      ),
    }))
    orderedIds.forEach((id, idx) => supabase.from('screens').update({ order: idx }).eq('id', id))
  },
  moveScreen(screenId, targetFlowId) {
    const flow = get().flows.find(f => f.id === targetFlowId)
    if (!flow) return
    const existing = get().screens.filter(sc => sc.flowId === targetFlowId)
    set(s => ({
      screens: s.screens.map(sc =>
        sc.id === screenId
          ? { ...sc, flowId: targetFlowId, featureId: flow.featureId, appId: flow.appId, order: existing.length }
          : sc,
      ),
    }))
    supabase.from('screens').update({
      flow_id: targetFlowId, feature_id: flow.featureId, app_id: flow.appId, order: existing.length,
    }).eq('id', screenId)
  },

  // ── Share ─────────────────────────────────────────────────
  generateShareLink(data) {
    const link: ShareLink = { ...data, id: uid(), createdAt: new Date().toISOString() }
    set(s => ({ shareLinks: [...s.shareLinks, link] }))
    supabase.from('share_links').insert({
      id: link.id, type: link.type, target_id: link.targetId,
      screen_ids: link.screenIds, label: link.label, created_at: link.createdAt,
    })
    return link
  },
  deleteShareLink(id) {
    set(s => ({ shareLinks: s.shareLinks.filter(l => l.id !== id) }))
    supabase.from('share_links').delete().eq('id', id)
  },

  // ── Filters ──────────────────────────────────────────────
  setSelectedApp(id) {
    set({ selectedAppId: id, selectedFeatureId: null, selectedFlowId: null })
  },
  setSelectedFeature(id) {
    set({ selectedFeatureId: id, selectedFlowId: null })
  },
  setSelectedFlow(id) {
    set({ selectedFlowId: id })
  },
  setSearchQuery(q) {
    set({ searchQuery: q })
  },
  toggleTag(tag) {
    set(s => ({
      selectedTags: s.selectedTags.includes(tag)
        ? s.selectedTags.filter(t => t !== tag)
        : [...s.selectedTags, tag],
    }))
  },
  toggleUiPattern(pattern) {
    set(s => ({
      selectedUiPatterns: s.selectedUiPatterns.includes(pattern)
        ? s.selectedUiPatterns.filter(p => p !== pattern)
        : [...s.selectedUiPatterns, pattern],
    }))
  },
  toggleCategory(category) {
    set(s => ({
      selectedCategories: s.selectedCategories.includes(category)
        ? s.selectedCategories.filter(c => c !== category)
        : [...s.selectedCategories, category],
    }))
  },

  // ── Derived ──────────────────────────────────────────────
  getFeaturesByApp(appId) {
    return get().features.filter(f => f.appId === appId).sort((a, b) => a.order - b.order)
  },
  getFlowsByFeature(featureId) {
    return get().flows.filter(f => f.featureId === featureId).sort((a, b) => a.order - b.order)
  },
  getScreensByFlow(flowId) {
    return get().screens.filter(sc => sc.flowId === flowId).sort((a, b) => a.order - b.order)
  },
  getScreenCount(featureId) {
    const flowIds = get().flows.filter(f => f.featureId === featureId).map(f => f.id)
    return get().screens.filter(sc => flowIds.includes(sc.flowId)).length
  },
  getAllTags() {
    const all = [
      ...get().flows.flatMap(f => f.tags),
      ...get().screens.flatMap(sc => sc.tags),
    ]
    return [...new Set(all)].sort()
  },
  getUiPatterns() {
    const { features, flows, screens } = get()
    const counts: Record<string, number> = {}
    features.forEach(feat => {
      const flowIds = flows.filter(f => f.featureId === feat.id).map(f => f.id)
      const count = screens.filter(sc => flowIds.includes(sc.flowId)).length
      if (count > 0) counts[feat.name] = (counts[feat.name] || 0) + count
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  },
  getCategories() {
    const { apps } = get()
    const counts: Record<string, number> = {}
    apps.forEach(app => {
      const cat = app.category ?? '기타'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  },
  searchScreens(query) {
    const q = query.toLowerCase()
    const { apps, features, flows, screens } = get()
    return screens.filter(sc => {
      const app = apps.find(a => a.id === sc.appId)
      const feat = features.find(f => f.id === sc.featureId)
      const flow = flows.find(f => f.id === sc.flowId)
      return (
        app?.name.toLowerCase().includes(q) ||
        feat?.name.toLowerCase().includes(q) ||
        flow?.name.toLowerCase().includes(q) ||
        sc.filename.toLowerCase().includes(q) ||
        sc.title?.toLowerCase().includes(q) ||
        sc.memo?.toLowerCase().includes(q) ||
        sc.tags.some(t => t.toLowerCase().includes(q))
      )
    })
  },
}))
