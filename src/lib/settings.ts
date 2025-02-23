const STORAGE_NAME = import.meta.env.VITE_STORAGE_NAME || 'sv_job-tracker'

export type Language = 'en' | 'de' | 'pl'

export interface SearchFilters {
  searchTerm: string
  isApplied: boolean
  isRejected: boolean
  isFavorite: boolean
}

interface Settings {
  language: Language
  lastChanged?: string
  filters: SearchFilters
}

const defaultSettings: Readonly<Settings> = {
  language: 'en',
  filters: {
    searchTerm: '',
    isApplied: true,
    isRejected: true,
    isFavorite: false,
  },
}

export const loadSettings = (): Settings => {
  const savedSettings = localStorage.getItem(STORAGE_NAME)
  if (savedSettings) {
    return { ...defaultSettings, ...JSON.parse(savedSettings) }
  }
  return defaultSettings
}

export const saveSettings = (settings: Settings): void => {
  localStorage.setItem(STORAGE_NAME, JSON.stringify({ ...defaultSettings, ...settings }))
}

export const getSetting = <K extends keyof Settings>(key: K): Settings[K] => {
  return loadSettings()[key]
}

export const setSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
  saveSettings({ ...loadSettings(), [key]: value })
}

export const settings = loadSettings()
