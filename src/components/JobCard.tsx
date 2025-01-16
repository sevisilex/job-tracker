import React from 'react';
import { Edit2, CheckCircle, XCircle, Archive, RotateCcw, Trash2 } from 'lucide-react';
import { JobApplication } from '../types';

interface JobCardProps {
  application: JobApplication;
  showArchived: boolean;
  onEdit: (app: JobApplication) => void;
  onApplyToggle: (app: JobApplication) => void;
  onRejectToggle: (app: JobApplication) => void;
  onArchiveToggle: (app: JobApplication) => void;
  onDelete: (id: number) => void;
}

const getBorderColor = (app: JobApplication): string => {
  if (app.rejectedAt) return 'border-red-500';
  if (app.appliedAt) return 'border-green-500';
  return 'border-blue-500';
};

const JobCard: React.FC<JobCardProps> = ({
  application: app,
  showArchived,
  onEdit,
  onApplyToggle,
  onRejectToggle,
  onArchiveToggle,
  onDelete
}) => {
  return (
    <div
      className={`bg-white p-4 rounded shadow-sm border-l-4 ${getBorderColor(app)}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-mono text-xl font-semibold">{app.title}</h3>
          <p className="font-mono text-sm text-gray-600 mt-1">
            {app.location}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {app.tags.map((tag, index) => (
              <span 
                key={index} 
                className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-mono text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="font-mono text-sm text-gray-500 mt-2">
            Utworzono: {new Date(app.createdAt).toLocaleDateString()}
          </p>
          {app.appliedAt && (
            <p className="font-mono text-sm text-green-500">
              Aplikowano: {new Date(app.appliedAt).toLocaleDateString()}
            </p>
          )}
          {app.rejectedAt && (
            <p className="font-mono text-sm text-red-500">
              Odrzucono: {new Date(app.rejectedAt).toLocaleDateString()}
            </p>
          )}
          {app.archivedAt && (
            <p className="font-mono text-sm text-yellow-600">
              Zarchiwizowano: {new Date(app.archivedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {!showArchived && (
            <>
              <button
                onClick={() => onEdit(app)}
                className="p-2 text-gray-600 hover:text-blue-500"
                title="Edytuj"
              >
                <Edit2 size={20} />
              </button>

              <button
                onClick={() => onApplyToggle(app)}
                className={`p-2 ${app.appliedAt ? 'text-green-500' : 'text-gray-600'} hover:text-green-700`}
                title={app.appliedAt ? 'Cofnij aplikację' : 'Oznacz jako aplikowane'}
              >
                <CheckCircle size={20} />
              </button>

              <button
                onClick={() => onRejectToggle(app)}
                className={`p-2 ${app.rejectedAt ? 'text-red-500' : 'text-gray-600'} hover:text-red-700`}
                title={app.rejectedAt ? 'Cofnij odrzucenie' : 'Oznacz jako odrzucone'}
              >
                <XCircle size={20} />
              </button>

              <button
                onClick={() => onArchiveToggle(app)}
                className="p-2 text-gray-600 hover:text-yellow-600"
                title="Archiwizuj"
              >
                <Archive size={20} />
              </button>
            </>
          )}

          {showArchived && (
            <>
              <button
                onClick={() => onArchiveToggle(app)}
                className="p-2 text-gray-600 hover:text-blue-500"
                title="Przywróć"
              >
                <RotateCcw size={20} />
              </button>

              <button
                onClick={() => app.id && onDelete(app.id)}
                className="p-2 text-gray-600 hover:text-red-500"
                title="Usuń trwale"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;