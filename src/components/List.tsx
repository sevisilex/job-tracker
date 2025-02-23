import React, { useState, useEffect } from 'react'
import { JobApplication, FormData } from '../types'
import { getAllApplications, saveApplication, updateApplicationStatus, deleteApplication } from '../lib/db'
import Header from './Header'
import JobCard from './JobCard'
import ApplicationModal from './ApplicationModal'
import ConfirmModal from './ConfirmModal'
import PromptModal from './PromptModal'
import CalendarModal from './CalendarModal'
import { formatDate } from '@/utils/dateFormatter'
import { useLanguage } from '../contexts/LanguageContext'
import { getSetting, setSetting } from '../lib/settings'

const List: React.FC = () => {
  const { t } = useLanguage()

  const [applications, setApplications] = useState<JobApplication[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentApplication, setCurrentApplication] = useState<JobApplication | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const savedFilters = getSetting('filters')
  const [searchTerm, setSearchTerm] = useState(savedFilters.searchTerm)
  const [isApplied, setIsApplied] = useState(savedFilters.isApplied)
  const [isRejected, setIsRejected] = useState(savedFilters.isRejected)
  const [isFavorite, setIsFavorite] = useState(savedFilters.isFavorite)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)

  useEffect(() => {
    setSetting('filters', { searchTerm, isApplied, isRejected, isFavorite })
  }, [searchTerm, isApplied, isRejected, isFavorite])

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    tags: [],
    url: '',
    url2: null,
    rejectedReason: '',
  })

  const loadApplications = async () => {
    const apps = await getAllApplications()
    setApplications(apps)
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const application: JobApplication = {
      ...formData,
      createdAt: formData.createdAt || currentApplication?.createdAt || new Date().toISOString(),
      appliedAt: formData.appliedAt || currentApplication?.appliedAt || null,
      rejectedAt: formData.rejectedAt || currentApplication?.rejectedAt || null,
      archivedAt: currentApplication?.archivedAt || null,
      favoriteAt: currentApplication?.favoriteAt || null,
      rejectedReason: formData.rejectedReason ?? null,
    }

    await saveApplication(application)
    if (currentApplication && currentApplication.createdAt !== application.createdAt) {
      await deleteApplication(currentApplication.createdAt)
    }

    setIsModalOpen(false)
    setCurrentApplication(null)
    setFormData({
      title: '',
      description: '',
      location: '',
      tags: [],
      url: '',
      url2: null,
      rejectedReason: '',
    })
    await loadApplications()
  }

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    message: string
    onConfirm: () => Promise<void>
  }>({
    isOpen: false,
    message: '',
    onConfirm: async () => {},
  })

  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean
    message: string
    onConfirm: (value: string) => void
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  })

  const showConfirmation = async (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        message,
        onConfirm: async () => {
          resolve(true)
          setConfirmModal((prev) => ({ ...prev, isOpen: false }))
        },
      })
    })
  }

  const showPrompt = async (message: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptModal({
        isOpen: true,
        message,
        onConfirm: (value: string) => {
          resolve(value)
          setPromptModal((prev) => ({ ...prev, isOpen: false }))
        },
      })
    })
  }

  const handleApplyToggle = async (app: JobApplication) => {
    if (!app.createdAt) return

    const message = app.appliedAt ? t('list.undoApplicationStatus') : t('list.markAsApplied')

    const confirmed = await showConfirmation(message)
    if (confirmed) {
      await updateApplicationStatus(app.createdAt, {
        appliedAt: app.appliedAt ? null : new Date().toISOString(),
      })
      await loadApplications()
    }
  }

  const handleRejectToggle = async (app: JobApplication) => {
    if (!app.createdAt) return

    if (!app.rejectedAt && !app.rejectedReason) {
      const reason = await showPrompt(t('list.markAsRejected'))
      if (reason) {
        await updateApplicationStatus(app.createdAt, {
          rejectedAt: new Date().toISOString(),
          ...(reason === '.' ? {} : { rejectedReason: reason }),
        })
        await loadApplications()
      }
    } else {
      const message = app.rejectedAt ? t('list.undoRejectionStatus') : t('list.markAsRejected')

      const confirmed = await showConfirmation(message)
      if (confirmed) {
        await updateApplicationStatus(app.createdAt, {
          rejectedAt: app.rejectedAt ? null : new Date().toISOString(),
        })
        await loadApplications()
      }
    }
  }

  const handleFavoriteToggle = async (app: JobApplication) => {
    if (!app.createdAt) return

    await updateApplicationStatus(app.createdAt, {
      favoriteAt: app.favoriteAt ? null : new Date().toISOString(),
    })
    await loadApplications()
  }

  const handleArchiveToggle = async (app: JobApplication) => {
    if (!app.createdAt) return

    const message = app.archivedAt ? t('list.restoreFromArchive') : t('list.moveToArchive')

    const confirmed = await showConfirmation(message)
    if (confirmed) {
      await updateApplicationStatus(app.createdAt, {
        archivedAt: app.archivedAt ? null : new Date().toISOString(),
      })
      await loadApplications()
    }
  }

  const handleDelete = async (createdAt: string) => {
    const confirmed = await showConfirmation(t('list.confirmDelete'))
    if (confirmed) {
      await deleteApplication(createdAt)
      await loadApplications()
    }
  }

  const filteredApplications = applications
    .filter((app) => Boolean(app.archivedAt) === showArchived)
    .filter((app) => {
      if (showArchived) return true

      const isAppApplied = !!app.appliedAt
      const isAppRejected = !!app.rejectedAt
      const isAppFavorite = !!app.favoriteAt

      let result = false

      if (isApplied && isRejected) result = true
      else if (isApplied && !isRejected) result = isAppApplied && !isAppRejected
      else if (!isApplied && isRejected) result = isAppRejected
      else if (!isAppApplied && !isAppRejected) result = true

      if (isFavorite && !isAppFavorite) result = false

      return result
    })
    .filter((app) => {
      if (!searchTerm) return true
      const searchLower = searchTerm.toLowerCase()
      const createdAtLocal = app.createdAt ? formatDate(app.createdAt) : ''
      const appliedAtLocal = app.appliedAt ? formatDate(app.appliedAt) : ''
      const rejectedAtLocal = app.rejectedAt ? formatDate(app.rejectedAt) : ''
      return (
        app.title.toLowerCase().includes(searchLower) ||
        app.description.toLowerCase().includes(searchLower) ||
        app.location.toLowerCase().includes(searchLower) ||
        app.url.toLowerCase().includes(searchLower) ||
        app.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        createdAtLocal.includes(searchLower) ||
        appliedAtLocal.includes(searchLower) ||
        rejectedAtLocal.includes(searchLower)
      )
    })
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Header
          showArchived={showArchived}
          searchTerm={searchTerm}
          isFavorite={isFavorite}
          isApplied={isApplied}
          isRejected={isRejected}
          onSearchChange={setSearchTerm}
          onArchiveToggle={() => setShowArchived(!showArchived)}
          onAddNew={() => setIsModalOpen(true)}
          onToggleApplied={() => setIsApplied(!isApplied)}
          onToggleRejected={() => setIsRejected(!isRejected)}
          onToggleFavorite={() => setIsFavorite(!isFavorite)}
          onShowCalendar={() => setIsCalendarModalOpen(true)}
        />

        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <JobCard
              key={app.createdAt}
              application={app}
              showArchived={showArchived}
              onEdit={(app) => {
                setCurrentApplication(app)
                setFormData(app as FormData) // BUG: check type it
                setIsModalOpen(true)
              }}
              onApplyToggle={handleApplyToggle}
              onRejectToggle={handleRejectToggle}
              onFavoriteToggle={handleFavoriteToggle}
              onArchiveToggle={handleArchiveToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <ApplicationModal
          isOpen={isModalOpen}
          currentApplication={currentApplication}
          formData={formData}
          disabled={showArchived}
          onClose={() => {
            setIsModalOpen(false)
            setCurrentApplication(null)
            setFormData({
              title: '',
              description: '',
              location: '',
              tags: [],
              url: '',
              url2: null,
              rejectedReason: '',
            })
          }}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
        />
      </div>

      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        applications={applications}
        onDateClick={(date) => {
          setSearchTerm(date)
          setIsCalendarModalOpen(false)
        }}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <PromptModal
        isOpen={promptModal.isOpen}
        message={promptModal.message}
        onConfirm={promptModal.onConfirm}
        onClose={() => setPromptModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

export default List
