import React from 'react'
import List from './components/List'
import { LanguageProvider } from './contexts/LanguageContext'
import './App.css'

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <List />
    </LanguageProvider>
  )
}

export default App
