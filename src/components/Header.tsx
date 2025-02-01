import React from 'react'
import { Plus, RotateCcw, Archive, Download, Search, Upload, Calendar as CalendarIcon, X, Languages } from 'lucide-react'
import { exportApplications, importApplications } from '@/lib/db'
import { useLanguage } from '../contexts/LanguageContext'

interface HeaderProps {
  showArchived: boolean
  searchTerm: string
  isApplied: boolean
  isRejected: boolean
  isFavorite: boolean
  onSearchChange: (value: string) => void
  onArchiveToggle: () => void
  onAddNew: () => void
  onToggleApplied: () => void
  onToggleRejected: () => void
  onShowCalendar: () => void
  onToggleFavorite: () => void
}

const Header: React.FC<HeaderProps> = ({
  showArchived,
  searchTerm,
  isApplied,
  isRejected,
  isFavorite,
  onSearchChange,
  onArchiveToggle,
  onAddNew,
  onToggleApplied,
  onToggleRejected,
  onToggleFavorite,
  onShowCalendar,
}) => {
  const { t, language, setLanguage } = useLanguage()

  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await importApplications(file)
      alert(`Zaimportowano ${result.imported} aplikacji, pominięto ${result.skipped} aplikacji.`)
      window.location.reload()
    } catch (error) {
      alert('Błąd podczas importowania: ' + (error as Error).message)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        if (document.activeElement !== searchInputRef.current) {
          e.preventDefault()
          searchInputRef.current?.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-mono font-bold">{t(showArchived ? 'applications.archived' : 'applications.title')}</h1>

          <div className="flex gap-4 mt-2">
            <button onClick={onArchiveToggle} className="text-blue-500 hover:text-blue-700 font-mono flex items-center gap-2">
              {showArchived ? <RotateCcw size={16} /> : <Archive size={16} />}
              {t(showArchived ? 'applications.showActive' : 'applications.showArchived')}
            </button>

            <button onClick={onShowCalendar} className="text-blue-500 hover:text-blue-700 font-mono flex items-center gap-2">
              <CalendarIcon size={20} className="mr-2" />
              {t('applications.calendar')}
            </button>

            <button onClick={exportApplications} className="text-blue-500 hover:text-blue-700 font-mono flex items-center gap-2">
              <Download size={16} />
              {t('applications.exportAll')}
            </button>

            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="text-blue-500 hover:text-blue-700 font-mono flex items-center gap-2">
              <Upload size={16} />
              {t('applications.import')}
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <button
            onClick={() => setLanguage(language === 'en' ? 'de' : language === 'de' ? 'pl' : 'en')}
            className="text-blue-500 hover:text-blue-700 font-mono flex items-center gap-2"
          >
            <Languages size={16} />
            {language === 'en' ? 'English' : language === 'de' ? 'Deutsch' : language === 'pl' ? 'Polski' : 'Unknown'}
          </button>
          {!showArchived && (
            <button onClick={onAddNew} className="bg-blue-500 text-white px-4 py-2 rounded font-mono flex items-center gap-2">
              <Plus size={20} />
              {t('common.create')}
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('applications.searchPlaceholder')}
            className="w-full p-2 pl-10 border rounded font-mono"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          {searchTerm && (
            <button onClick={() => onSearchChange('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {!showArchived && (
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 font-mono">
            <input type="checkbox" checked={isApplied} onChange={onToggleApplied} className="form-checkbox h-4 w-4 text-blue-500" />
            {t('applications.applied')}
          </label>
          <label className="flex items-center gap-2 font-mono">
            <input type="checkbox" checked={isRejected} onChange={onToggleRejected} className="form-checkbox h-4 w-4 text-blue-500" />
            {t('applications.rejected')}
          </label>
          <label className="flex items-center gap-2 font-mono">
            <input type="checkbox" checked={isFavorite} onChange={onToggleFavorite} className="form-checkbox h-4 w-4 text-blue-500" />
            {t('applications.favorite')}
          </label>
        </div>
      )}
    </>
  )
}

export default Header
