import React, { useState, useEffect } from 'react'
import List from './components/List'
import { LanguageProvider } from './contexts/LanguageContext'
import { AboutModal } from './components/AboutModal'
import './App.css'

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalOpen(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <LanguageProvider>
      <List />
      <AboutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </LanguageProvider>
  )
}

export default App
