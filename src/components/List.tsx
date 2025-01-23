import React, { useState, useEffect } from 'react';
import { JobApplication, FormData } from '../types';
import { getAllApplications, saveApplication, updateApplicationStatus, deleteApplication } from '../lib/db';
import Header from './Header';
import JobCard from './JobCard';
import ApplicationModal from './ApplicationModal';
import ConfirmModal from './ConfirmModal';
import PromptModal from './PromptModal';
import CalendarModal from './CalendarModal';

const List: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<JobApplication | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isApplied, setIsApplied] = useState(true);
  const [isRejected, setIsRejected] = useState(true);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    tags: [],
    url: '',
    url2: null,
    rejectedReason: '',
  });

  const loadApplications = async () => {
    const apps = await getAllApplications();
    setApplications(apps);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const application: JobApplication = {
      ...formData,
      createdAt: currentApplication?.createdAt || new Date().toISOString(),
      appliedAt: currentApplication?.appliedAt || null,
      rejectedAt: currentApplication?.rejectedAt || null,
      archivedAt: currentApplication?.archivedAt || null,
    };

    await saveApplication(application);

    setIsModalOpen(false);
    setCurrentApplication(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      tags: [],
      url: '',
      url2: null,
      rejectedReason: '',
    });
    await loadApplications();
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    message: '',
    onConfirm: async () => { },
  });

  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: (value: string) => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => { },
  });

  // Helper function for confirmation
  const showConfirmation = async (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        message,
        onConfirm: async () => {
          resolve(true);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        },
      });
    });
  };

  const showPrompt = async (message: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptModal({
        isOpen: true,
        message,
        onConfirm: (value: string) => {
          resolve(value);
          setPromptModal(prev => ({ ...prev, isOpen: false }));
        },
      });
    });
  };

  // Update handleApplyToggle
  const handleApplyToggle = async (app: JobApplication) => {
    if (!app.createdAt) return;

    const message = app.appliedAt
      ? 'Czy na pewno chcesz cofnąć status aplikacji? Data aplikacji zostanie usunięta.'
      : 'Czy chcesz oznaczyć aplikację jako wysłaną? Zostanie ustawiona dzisiejsza data.';

    const confirmed = await showConfirmation(message);
    if (confirmed) {
      await updateApplicationStatus(app.createdAt, {
        appliedAt: app.appliedAt ? null : new Date().toISOString()
      });
      await loadApplications();
    }
  };

  // Update handleRejectToggle
  const handleRejectToggle = async (app: JobApplication) => {
    if (!app.createdAt) return;

    if (!app.rejectedAt && !app.rejectedReason) {
      const reason = await showPrompt('Czy chcesz oznaczyć aplikację jako odrzuconą? Podaj powód i zostanie ustawiona dzisiejsza data. Bez powodu to wpisz "."');
      if (reason) {
        await updateApplicationStatus(app.createdAt, {
          rejectedAt: new Date().toISOString(),
          ...(reason === '.' ? {} : { rejectedReason: reason })
        });
        await loadApplications();
      }
    } else {
      const message = app.rejectedAt
        ? 'Czy na pewno chcesz cofnąć status odrzucenia? Data odrzucenia zostanie usunięta.'
        : 'Czy chcesz oznaczyć aplikację jako odrzuconą? Zostanie ustawiona dzisiejsza data.';

      const confirmed = await showConfirmation(message);
      if (confirmed) {
        await updateApplicationStatus(app.createdAt, {
          rejectedAt: app.rejectedAt ? null : new Date().toISOString()
        });
        await loadApplications();
      }
    }
  };

  // Update handleArchiveToggle
  const handleArchiveToggle = async (app: JobApplication) => {
    if (!app.createdAt) return;

    const message = app.archivedAt
      ? 'Czy chcesz przywrócić tę aplikację z archiwum?'
      : 'Czy chcesz przenieść tę aplikację do archiwum?';

    const confirmed = await showConfirmation(message);
    if (confirmed) {
      await updateApplicationStatus(app.createdAt, {
        archivedAt: app.archivedAt ? null : new Date().toISOString()
      });
      await loadApplications();
    }
  };

  // Update handleDelete
  const handleDelete = async (createdAt: string) => {
    const confirmed = await showConfirmation(
      'Czy na pewno chcesz trwale usunąć tę aplikację? Tej operacji nie można cofnąć.'
    );
    if (confirmed) {
      await deleteApplication(createdAt);
      await loadApplications();
    }
  };



  const filteredApplications = applications
    .filter(app => Boolean(app.archivedAt) === showArchived)
    .filter(app => {
      if (showArchived) return true;

      const isAppApplied = !!app.appliedAt;
      const isAppRejected = !!app.rejectedAt;

      if (isApplied && isRejected) return true
      else if (isApplied && !isRejected) return isAppApplied && !isAppRejected
      else if (!isApplied && isRejected) return isAppRejected
      else if (!isAppApplied && !isAppRejected) return true
      return false
    })
    .filter(app => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        app.title.toLowerCase().includes(searchLower) ||
        app.description.toLowerCase().includes(searchLower) ||
        app.location.toLowerCase().includes(searchLower) ||
        app.url.toLowerCase().includes(searchLower) ||
        app.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Header
          showArchived={showArchived}
          searchTerm={searchTerm}
          isApplied={isApplied}
          isRejected={isRejected}
          onSearchChange={setSearchTerm}
          onArchiveToggle={() => setShowArchived(!showArchived)}
          onAddNew={() => setIsModalOpen(true)}
          onToggleApplied={() => setIsApplied(!isApplied)}
          onToggleRejected={() => setIsRejected(!isRejected)}
          onShowCalendar={() => setIsCalendarModalOpen(true)}
        />

        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <JobCard
              key={app.createdAt}
              application={app}
              showArchived={showArchived}
              onEdit={(app) => {
                setCurrentApplication(app);
                setFormData(app);
                setIsModalOpen(true);
              }}
              onApplyToggle={handleApplyToggle}
              onRejectToggle={handleRejectToggle}
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
            setIsModalOpen(false);
            setCurrentApplication(null);
            setFormData({
              title: '',
              description: '',
              location: '',
              tags: [],
              url: '',
              url2: null,
              rejectedReason: '',
            });
          }}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
        />
      </div>

      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        applications={applications}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <PromptModal
        isOpen={promptModal.isOpen}
        message={promptModal.message}
        onConfirm={promptModal.onConfirm}
        onClose={() => setPromptModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default List;