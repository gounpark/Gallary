export interface App {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  category?: string
  createdAt: string
}

export interface Feature {
  id: string
  appId: string
  name: string
  description?: string
  order: number
}

export interface Flow {
  id: string
  appId: string
  featureId: string
  name: string
  description?: string
  tags: string[]
  order: number
}

export interface Screen {
  id: string
  appId: string
  featureId: string
  flowId: string
  filename: string
  title?: string
  memo?: string
  order: number
  tags: string[]
}

export interface ShareLink {
  id: string
  type: 'app' | 'feature' | 'flow' | 'custom'
  targetId: string
  screenIds?: string[]
  label?: string
  createdAt: string
}

export interface FilterState {
  selectedAppId: string | null
  selectedFeatureId: string | null
  selectedFlowId: string | null
  selectedTags: string[]
  selectedUiPatterns: string[]
  selectedCategories: string[]
  searchQuery: string
}

export interface ParsedFilename {
  appName: string
  featureName: string
  flowName: string
  order: number
  raw: string
}
