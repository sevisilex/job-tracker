import React, { useState, useEffect } from 'react'
import List from './components/List'
import { LanguageProvider } from './contexts/LanguageContext'
import { AboutModal } from './components/AboutModal'
import { Coffee, Heart } from 'lucide-react'
import './App.css'

const App: React.FC = () => {
  const [isAboutDialog, setIsAboutDialog] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAboutDialog(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <LanguageProvider>
      <a
        href="https://ko-fi.com/svslx"
        target="_blank"
        className={`group fixed bottom-8 right-4 inline-flex items-center px-4 py-2 bg-yellow-400 text-black rounded hover:bg-black hover:text-white duration-300 transition-all hover:opacity-100 ${isAboutDialog ? 'opacity-0' : 'opacity-50'}`}
      >
        <span className="relative">
          <Coffee size={24} className="mr-2 transition-opacity duration-300 ease-in-out group-hover:opacity-0" />
          <Heart
            size={24}
            className="mr-2 text-red-500 absolute left-0 top-0 opacity-0 transition-all duration-300 ease-in-out scale-0 rotate-0 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-12"
          />
        </span>
        Buy me a coffee
      </a>
      <List />
      <AboutModal isOpen={isAboutDialog} onClose={() => setIsAboutDialog(false)} />
    </LanguageProvider>
  )
}

export default App
