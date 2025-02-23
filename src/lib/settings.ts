export type Language = 'en' | 'de' | 'pl'

interface Settings {
  language: Language
  lastChanged?: string
}

const STORAGE_NAME = import.meta.env.VITE_STORAGE_NAME || 'cv-settings'

const defaultSettings: Readonly<Settings> = {
  language: 'en',
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

export const getSetting = (key: keyof Settings): any => {
  return loadSettings()[key]
}

export const setSetting = (key: keyof Settings, value: any) => {
  saveSettings({ ...loadSettings(), [key]: value })
}

export const settings = loadSettings()
