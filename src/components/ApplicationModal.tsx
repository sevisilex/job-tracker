import React from 'react'
import { Tag, X } from 'lucide-react'
import { JobApplication, FormData, tagsStringToArray, tagsArrayToString } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import { formatDate } from '@/utils/dateFormatter'

interface ApplicationModalProps {
  isOpen: boolean
  currentApplication: JobApplication | null
  formData: FormData
  disabled?: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onFormDataChange: (data: FormData) => void
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, currentApplication, formData, disabled = false, onClose, onSubmit, onFormDataChange }) => {
  const { t } = useLanguage()

  const [showDates, setShowDates] = React.useState(false)

  const predefinedTags = [
    [
      'typescript',
      'vue',
      'react',
      'angular',
      'node',
      'aws',
      'nuxt',
      'next',
      'java',
      'c#',
      'c++',
      'mongodb',
      'prisma',
      'docker',
      'php',
      'laravel',
      'mysql',
    ].sort(),
    ['agency', 'remote', 'hybrid', 'email', 'disabled', 'english'],
    ['linkedin', 'xing', 'myability', 'stepstone', 'join'],
  ]

  const addTag = (newTag: string) => {
    if (!formData.tags.includes(newTag)) {
      onFormDataChange({
        ...formData,
        tags: [...formData.tags, newTag],
      })
    }
  }

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Uciecz specjalne znaki
  };
  
  const extractTagsFromText = () => {
    const text = `${formData.title} ${formData.description} ${formData.url} ${formData.url2 || ''}`.toLowerCase();
    const matchedTags = predefinedTags.flat().filter(tag => {
      const escapedTag = escapeRegExp(tag); // Uciecz tag
      const regex = new RegExp(`\\b${escapedTag}\\b`, 'i'); // Dopasuj tylko całe słowa
      return regex.test(text);
    });
    onFormDataChange({
      ...formData,
      tags: Array.from(new Set([...formData.tags, ...matchedTags])),
    });
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-4/5 max-h-screen overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-mono font-bold">
              {t(disabled ? 'applications.archived' : currentApplication ? 'applications.editApplication' : 'applications.newApplication')}
            </h2>
            {currentApplication && !disabled && (
              <button
                type="button"
                onClick={() => setShowDates(!showDates)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-mono text-sm py-1 px-3 rounded"
              >
                {t(showDates ? 'form.hideDates' : 'form.showDates')}
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {currentApplication && showDates && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="font-mono block mb-2 text-sm">{t('form.creationDate')}</label>
                <input
                  type="text"
                  value={formatDate(formData.createdAt || currentApplication.createdAt)}
                  onChange={(e) => {
                    const dateStr = e.target.value.replace(/\./g, '-')
                    const date = new Date(dateStr)
                    if (!isNaN(date.getTime())) {
                      onFormDataChange({ ...formData, createdAt: date.toISOString() })
                    }
                  }}
                  className="w-full p-2 border rounded font-mono text-sm"
                  placeholder="RRRR.MM.DD GG:MM"
                />
              </div>

              <div>
                <label className="font-mono block mb-2 text-sm">{t('form.applicationDate')}</label>
                <input
                  type="text"
                  value={currentApplication.appliedAt ? formatDate(formData.appliedAt || currentApplication.appliedAt) : ''}
                  onChange={(e) => {
                    const dateStr = e.target.value.replace(/\./g, '-')
                    const date = new Date(dateStr)
                    if (!isNaN(date.getTime())) {
                      onFormDataChange({ ...formData, appliedAt: date.toISOString() })
                    }
                  }}
                  className="w-full p-2 border rounded font-mono text-sm"
                  placeholder="RRRR.MM.DD GG:MM"
                  disabled={!currentApplication.appliedAt}
                />
              </div>

              <div>
                <label className="font-mono block mb-2 text-sm">{t('form.rejectionDate')}</label>
                <input
                  type="text"
                  value={currentApplication.rejectedAt ? formatDate(formData.rejectedAt || currentApplication.rejectedAt) : ''}
                  onChange={(e) => {
                    const dateStr = e.target.value.replace(/\./g, '-')
                    const date = new Date(dateStr)
                    if (!isNaN(date.getTime())) {
                      onFormDataChange({ ...formData, rejectedAt: date.toISOString() })
                    }
                  }}
                  className="w-full p-2 border rounded font-mono text-sm"
                  placeholder="RRRR.MM.DD GG:MM"
                  disabled={!currentApplication.rejectedAt}
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-mono block mb-2">{t('form.title')}</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded font-mono"
              required
              disabled={disabled}
            />
          </div>

          <div>
            <label className="font-mono block mb-2">{t('form.description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded font-mono h-32"
              maxLength={10000}
              disabled={disabled}
            />
          </div>

          <div>
            <label className="font-mono block mb-2">{t('form.location')}</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => {
                const cursorPosition = e.target.selectionStart
                onFormDataChange({ ...formData, location: e.target.value.toLowerCase() })
                setTimeout(() => {
                  e.target.setSelectionRange(cursorPosition, cursorPosition)
                }, 0)
              }}
              className="w-full p-2 border rounded font-mono"
              disabled={disabled}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="font-mono block mb-2">{t('form.tags')}</label>
              {disabled ? (
                ''
              ) : (
                <button
                  type="button"
                  className="text-blue-500 hover:text-blue-700 font-mono flex items-center gap-2"
                  onClick={extractTagsFromText}
                >
                  <Tag className="h-4 w-4" />
                  {t('form.extractTags')}
                </button>
              )}
            </div>
            <input
              type="text"
              value={tagsArrayToString(formData.tags)}
              onChange={(e) => {
                const cursorPosition = e.target.selectionStart
                onFormDataChange({ ...formData, tags: tagsStringToArray(e.target.value) })
                setTimeout(() => {
                  e.target.setSelectionRange(cursorPosition, cursorPosition)
                }, 0)
              }}
              className="w-full p-2 border rounded font-mono"
              placeholder="homeoffice, warsaw, java"
              disabled={disabled}
            />
            {!disabled && (
              <div className="mt-2 space-y-2">
                {predefinedTags.map((tagGroup, groupIndex) => (
                  <div key={groupIndex} className="flex flex-wrap gap-2">
                    {tagGroup
                      .filter((tag) => !formData.tags.includes(tag))
                      .map((tag, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => addTag(tag)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-mono text-xs py-1 px-3 rounded-full"
                          disabled={disabled}
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="font-mono block mb-2">{t('form.url')}</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => onFormDataChange({ ...formData, url: e.target.value })}
              className="w-full p-2 border rounded font-mono"
              disabled={disabled}
            />
            <input
              type="url"
              value={formData.url2 || ''}
              onChange={(e) => onFormDataChange({ ...formData, url2: e.target.value || null })}
              className="w-full p-2 border rounded font-mono"
              disabled={disabled}
            />
          </div>

          {currentApplication?.rejectedAt && (
            <div>
              <label className="font-mono block mb-2">{t('form.rejectionReason')}</label>
              <input
                type="text"
                value={formData.rejectedReason || ''}
                onChange={(e) => onFormDataChange({ ...formData, rejectedReason: e.target.value })}
                className="w-full p-2 border rounded font-mono"
                disabled={disabled}
              />
            </div>
          )}

          {!disabled && (
            <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 font-mono">
              {t(currentApplication ? 'common.save' : 'common.create')}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

export default ApplicationModal
