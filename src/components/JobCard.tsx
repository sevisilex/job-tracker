import React from 'react'
import { File, FilePen, CheckCircle, XCircle, Archive, RotateCcw, Trash2, ExternalLink } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { JobApplication } from '../types'
import { formatDate } from '../utils/dateFormatter'

interface JobCardProps {
  application: JobApplication
  showArchived: boolean
  onEdit: (app: JobApplication) => void
  onApplyToggle: (app: JobApplication) => void
  onRejectToggle: (app: JobApplication) => void
  onArchiveToggle: (app: JobApplication) => void
  onDelete: (createdAt: string) => void
}

const getBorderColor = (app: JobApplication): string => {
  if (app.rejectedAt) return 'border-red-500'
  if (app.appliedAt) return 'border-green-500'
  return 'border-blue-500'
}

const JobCard: React.FC<JobCardProps> = ({ application: app, showArchived, onEdit, onApplyToggle, onRejectToggle, onArchiveToggle, onDelete }) => {
  const { t } = useLanguage()

  return (
    <div className={`bg-white p-4 rounded shadow-sm border-l-4 ${getBorderColor(app)}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-mono text-xl font-semibold">{app.title}</h3>
          <p className="font-mono text-sm text-gray-600 mt-1">{app.location}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {app.tags.sort().map((tag, index) => (
              <span key={index} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-mono text-gray-700">
                {tag}
              </span>
            ))}
          </div>
          <p className="font-mono text-sm text-gray-500 mt-2">
            {t('applications.created')}: {formatDate(app.createdAt)}
          </p>
          {app.appliedAt && (
            <p className="font-mono text-sm text-green-500">
              {t('applications.applied')}: {formatDate(app.appliedAt)}
            </p>
          )}
          {app.rejectedAt && (
            <p className="font-mono text-sm text-red-500">
              {t('applications.rejected')}: {formatDate(app.rejectedAt)}
              {app.rejectedReason && ` - ${app.rejectedReason}`}
            </p>
          )}
          {app.archivedAt && (
            <p className="font-mono text-sm text-yellow-600">
              {t('applications.archived_status')}: {formatDate(app.archivedAt)}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {!showArchived && (
            <>
              <div className="flex gap-2">
                <button onClick={() => onEdit(app)} className="p-2 text-gray-600 hover:text-blue-500" title={t('common.edit')}>
                  <FilePen size={20} />
                </button>

                <button
                  onClick={() => onApplyToggle(app)}
                  className={`p-2 ${app.appliedAt ? 'text-green-500' : 'text-gray-600'} hover:text-green-700`}
                  title={t(app.appliedAt ? 'applications.undoApply' : 'applications.markAsApplied')}
                >
                  <CheckCircle size={20} />
                </button>

                <button
                  onClick={() => onRejectToggle(app)}
                  className={`p-2 ${app.rejectedAt ? 'text-red-500' : 'text-gray-600'} hover:text-red-700`}
                  title={t(app.rejectedAt ? 'applications.undoReject' : 'applications.markAsRejected')}
                >
                  <XCircle size={20} />
                </button>

                <button onClick={() => onArchiveToggle(app)} className="p-2 text-gray-600 hover:text-yellow-600" title={t('applications.archive')}>
                  <Archive size={20} />
                </button>
              </div>

              {app.url && (
                <div className="flex gap-2 justify-end">
                  <a href={app.url} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:text-blue-500" title={app.url}>
                    <ExternalLink size={20} />
                  </a>
                </div>
              )}

              {app.url2 && (
                <div className="flex gap-2 justify-end">
                  <a href={app.url2} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:text-blue-500" title={app.url2}>
                    <ExternalLink size={20} />
                  </a>
                </div>
              )}
            </>
          )}

          {showArchived && (
            <>
              <div className="flex gap-2">
                <button onClick={() => onEdit(app)} className="p-2 text-gray-300 hover:text-blue-300" title={t('common.view')}>
                  <File size={20} />
                </button>

                <button onClick={() => onArchiveToggle(app)} className="p-2 text-gray-600 hover:text-blue-500" title={t('applications.restore')}>
                  <RotateCcw size={20} />
                </button>

                <button onClick={() => onDelete(app.createdAt)} className="p-2 text-gray-600 hover:text-red-500" title={t('common.delete')}>
                  <Trash2 size={20} />
                </button>
              </div>
              {app.url && (
                <div className="flex gap-2 justify-end">
                  <a href={app.url} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:text-blue-500" title={app.url}>
                    <ExternalLink size={20} />
                  </a>
                </div>
              )}

              {app.url2 && (
                <div className="flex gap-2 justify-end">
                  <a href={app.url2} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:text-blue-500" title={app.url2}>
                    <ExternalLink size={20} />
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobCard
