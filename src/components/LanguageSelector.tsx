import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage()

  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'de' | 'pl')} className="p-2 border rounded font-mono text-sm">
      <option value="en">English</option>
      <option value="de">Deutsch</option>
      <option value="pl">Polski</option>
    </select>
  )
}

export default LanguageSelector
