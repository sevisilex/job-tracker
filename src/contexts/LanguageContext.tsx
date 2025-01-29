import React, { createContext, useContext, useState } from 'react'
import { translations } from '../i18n/translations'

type Language = 'en' | 'de' | 'pl'

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
  const [language, setLanguage] = useState<Language>('pl')

  const t = (key: string): string => {
    const keys = key.split('.')
    let current: TranslationValue = translations[language]

    for (const k of keys) {
      if (current[k] === undefined) {
        console.warn(`Translation missing for key: ${key} in language: ${language}`)
        return key
      }
      if (typeof current[k] === 'string') {
        return current[k]
      }
      current = current[k]
    }
    // return `💖`
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
