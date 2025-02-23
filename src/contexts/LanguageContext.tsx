import React, { createContext, useContext, useState } from 'react'
import { translations } from '../i18n/translations'
import { getSetting, setSetting, Language } from '../lib/settings'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface TranslationValue {
  [key: string]: string | TranslationValue
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => getSetting('language'))

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    setSetting('language', lang)
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
