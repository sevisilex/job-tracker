import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../i18n/translations'

type Language = 'en' | 'de' | 'pl'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

interface CvSettings {
  language: Language
  lastChanged?: string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface TranslationValue {
  [key: string]: string | TranslationValue
}

const CV_SETTINGS_KEY = 'cv-settings'

const getStoredSettings = (): CvSettings | null => {
  const stored = localStorage.getItem(CV_SETTINGS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse stored settings:', e)
    }
  }
  return null
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = getStoredSettings()
    return stored?.language || 'pl'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    const settings: CvSettings = {
      language: lang,
      lastChanged: new Date().toISOString()
    }
    localStorage.setItem(CV_SETTINGS_KEY, JSON.stringify(settings))
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let current: TranslationValue = translations[language]

    for (const k of keys) {
      if (current[k] === undefined) {
        console.warn(`Translation missing for key: ${key} in language: ${language}`)
        return key
      }
      if (typeof current[k] === 'string') {
        return current[k] as string
      }
      current = current[k] as TranslationValue
    }
    return key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
