import React, { useState, useEffect } from 'react';
import { JobApplication, FormData } from '../types';
import { getAllApplications, saveApplication, updateApplicationStatus, deleteApplication, exportApplications } from '../lib/db';
import Header from './Header';
import JobCard from './JobCard';
import ApplicationModal from './ApplicationModal';

const List: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<JobApplication | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isApplied, setIsApplied] = useState(true);
  const [isRejected, setIsRejected] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    tags: [],
    url: '',
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
      ...(currentApplication?.id ? { id: currentApplication.id } : {})
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
      rejectedReason: '',
    });
    await loadApplications();
  };

  const handleApplyToggle = async (app: JobApplication) => {
    if (!app.id) return;

    const message = app.appliedAt
      ? 'Czy na pewno chcesz cofnąć status aplikacji? Data aplikacji zostanie usunięta.'
      : 'Czy chcesz oznaczyć aplikację jako wysłaną? Zostanie ustawiona dzisiejsza data.';

    if (window.confirm(message)) {
      await updateApplicationStatus(app.id, {
        appliedAt: app.appliedAt ? null : new Date().toISOString()
      });
      await loadApplications();
    }
  };

  const handleRejectToggle = async (app: JobApplication) => {
    if (!app.id) return;

    if (!app.rejectedAt && !app.rejectedReason) {
      const reason = window.prompt('Czy chcesz oznaczyć aplikację jako odrzuconą? Podaj powodu i zostanie ustawiona dzisiejsza data. Bez powodu to wpsiz "."')
      if (reason) {
        await updateApplicationStatus(app.id, {
          rejectedAt: new Date().toISOString(),
          ...(reason === '.' ? {} : { rejectedAt: reason })
        });
        await loadApplications();
      }
    } else {
      const message = app.rejectedAt
        ? 'Czy na pewno chcesz cofnąć status odrzucenia? Data odrzucenia zostanie usunięta.'
        : 'Czy chcesz oznaczyć aplikację jako odrzuconą? Zostanie ustawiona dzisiejsza data.';

      if (window.confirm(message)) {
        await updateApplicationStatus(app.id, {
          rejectedAt: app.rejectedAt ? null : new Date().toISOString()
        });
        await loadApplications();
      }
    }
  };

  const handleArchiveToggle = async (app: JobApplication) => {
    if (!app.id) return;

    const message = app.archivedAt
      ? 'Czy chcesz przywrócić tę aplikację z archiwum?'
      : 'Czy chcesz przenieść tę aplikację do archiwum?';

    if (window.confirm(message)) {
      await updateApplicationStatus(app.id, {
        archivedAt: app.archivedAt ? null : new Date().toISOString()
      });
      await loadApplications();
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Czy na pewno chcesz trwale usunąć tę aplikację? Tej operacji nie można cofnąć.')) {
      return;
    }

    await deleteApplication(id);
    await loadApplications();
  };

  const filteredApplications = applications
    .filter(app => Boolean(app.archivedAt) === showArchived)
    .filter(app => {
      if (showArchived) return true;

      const isAppApplied = !!app.appliedAt;
      const isAppRejected = !!app.rejectedAt;

      return !(!isApplied && isAppApplied) && !(!isRejected && isAppRejected)
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
          onExport={exportApplications}
          onAddNew={() => setIsModalOpen(true)}
          onToggleApplied={() => setIsApplied(!isApplied)}
          onToggleRejected={() => setIsRejected(!isRejected)}
        />

        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <JobCard
              key={app.id}
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
          onClose={() => {
            setIsModalOpen(false);
            setCurrentApplication(null);
            setFormData({
              title: '',
              description: '',
              location: '',
              tags: [],
              url: '',
              rejectedReason: '',
            });
          }}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
        />
      </div>
    </div>
  );
};

export default List;