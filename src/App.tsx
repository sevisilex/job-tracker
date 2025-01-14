import React, { useState, useEffect, FormEvent } from 'react';
import { X, Edit2, Plus, Archive, RotateCcw, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface JobApplication {
  id?: number;
  title: string;
  description: string;
  location: string;
  tags: string[];
  url: string;
  createdAt: string;
  appliedAt: string | null;
  rejectedAt: string | null;
  isArchived: boolean;
}

type FormData = Omit<JobApplication, 'id' | 'createdAt' | 'appliedAt' | 'rejectedAt' | 'isArchived'>;

const initDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('JobApplicationsDB', 2);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('applications')) {
        const store = db.createObjectStore('applications', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        
        store.createIndex('title', 'title', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('isArchived', 'isArchived', { unique: false });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
  });
};

const App: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<JobApplication | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    tags: [],
    url: '',
  });

  const tagsStringToArray = (tagsStr: string): string[] => {
    return tagsStr.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag !== '');
  };

  const tagsArrayToString = (tags: string[]): string => {
    return tags.join(', ');
  };

  const loadApplications = async () => {
    const db = await initDB();
    const transaction = db.transaction(['applications'], 'readonly');
    const store = transaction.objectStore('applications');
    const request = store.getAll();
    
    request.onsuccess = () => {
      setApplications(request.result);
    };
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const db = await initDB();
    const transaction = db.transaction(['applications'], 'readwrite');
    const store = transaction.objectStore('applications');
    
    const application: JobApplication = {
      ...formData,
      createdAt: currentApplication?.createdAt || new Date().toISOString(),
      appliedAt: currentApplication?.appliedAt || null,
      rejectedAt: currentApplication?.rejectedAt || null,
      isArchived: currentApplication?.isArchived || false,
      ...(currentApplication?.id ? { id: currentApplication.id } : {})
    };
    
    if (currentApplication) {
      store.put(application);
    } else {
      store.add(application);
    }
    
    transaction.oncomplete = () => {
      setIsModalOpen(false);
      setCurrentApplication(null);
      setFormData({
        title: '',
        description: '',
        location: '',
        tags: [],
        url: '',
      });
      loadApplications();
    };
  };

  const updateApplicationStatus = async (id: number, updates: Partial<JobApplication>) => {
    const db = await initDB();
    const transaction = db.transaction(['applications'], 'readwrite');
    const store = transaction.objectStore('applications');
    
    const request = store.get(id);
    request.onsuccess = () => {
      const application = request.result;
      const updatedApplication = { ...application, ...updates };
      store.put(updatedApplication);
    };
    
    transaction.oncomplete = () => {
      loadApplications();
    };
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Czy na pewno chcesz trwale usunąć tę aplikację? Tej operacji nie można cofnąć.')) {
      return;
    }

    const db = await initDB();
    const transaction = db.transaction(['applications'], 'readwrite');
    const store = transaction.objectStore('applications');
    store.delete(id);
    
    transaction.oncomplete = () => {
      loadApplications();
    };
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
    }
  };

  const handleRejectToggle = async (app: JobApplication) => {
    if (!app.id) return;

    const message = app.rejectedAt
      ? 'Czy na pewno chcesz cofnąć status odrzucenia? Data odrzucenia zostanie usunięta.'
      : 'Czy chcesz oznaczyć aplikację jako odrzuconą? Zostanie ustawiona dzisiejsza data.';

    if (window.confirm(message)) {
      await updateApplicationStatus(app.id, {
        rejectedAt: app.rejectedAt ? null : new Date().toISOString()
      });
    }
  };

  const handleArchiveToggle = async (app: JobApplication) => {
    if (!app.id) return;

    const message = app.isArchived
      ? 'Czy chcesz przywrócić tę aplikację z archiwum?'
      : 'Czy chcesz przenieść tę aplikację do archiwum?';

    if (window.confirm(message)) {
      await updateApplicationStatus(app.id, {
        isArchived: !app.isArchived
      });
    }
  };

  const filteredApplications = applications.filter(app => app.isArchived === showArchived);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-mono font-bold">
              {showArchived ? 'Zarchiwizowane Aplikacje' : 'Lista Aplikacji o Pracę'}
            </h1>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="mt-2 text-blue-500 hover:text-blue-700 font-mono flex items-center gap-2"
            >
              {showArchived ? <RotateCcw size={16} /> : <Archive size={16} />}
              {showArchived ? 'Powrót do aktywnych' : 'Pokaż zarchiwizowane'}
            </button>
          </div>
          {!showArchived && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus size={20} />
              Dodaj
            </button>
          )}
        </div>

        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white p-4 rounded shadow-sm border-l-4 border-blue-500"
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
                </div>
                <div className="flex gap-2">
                  {!showArchived && (
                    <>
                      <button
                        onClick={() => {
                          setCurrentApplication(app);
                          setFormData(app);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-500"
                        title="Edytuj"
                      >
                        <Edit2 size={20} />
                      </button>

                      <button
                        onClick={() => handleApplyToggle(app)}
                        className={`p-2 ${app.appliedAt ? 'text-green-500' : 'text-gray-600'} hover:text-green-700`}
                        title={app.appliedAt ? 'Cofnij aplikację' : 'Oznacz jako aplikowane'}
                      >
                        <CheckCircle size={20} />
                      </button>

                      <button
                        onClick={() => handleRejectToggle(app)}
                        className={`p-2 ${app.rejectedAt ? 'text-red-500' : 'text-gray-600'} hover:text-red-700`}
                        title={app.rejectedAt ? 'Cofnij odrzucenie' : 'Oznacz jako odrzucone'}
                      >
                        <XCircle size={20} />
                      </button>

                      <button
                        onClick={() => handleArchiveToggle(app)}
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
                        onClick={() => handleArchiveToggle(app)}
                        className="p-2 text-gray-600 hover:text-blue-500"
                        title="Przywróć"
                      >
                        <RotateCcw size={20} />
                      </button>

                      <button
                        onClick={() => app.id && handleDelete(app.id)}
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
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-4/5 max-h-screen overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-mono font-bold">
                  {currentApplication ? 'Edytuj aplikację' : 'Nowa aplikacja'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentApplication(null);
                    setFormData({
                      title: '',
                      description: '',
                      location: '',
                      tags: [],
                      url: '',
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="font-mono block mb-2">Tytuł</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2 border rounded font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-mono block mb-2">Opis</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 border rounded font-mono h-32"
                    maxLength={10000}
                  />
                </div>

                <div>
                  <label className="font-mono block mb-2">Lokalizacja</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full p-2 border rounded font-mono"
                  />
                </div>

                <div>
                  <label className="font-mono block mb-2">
                    Tagi (rozdzielane przecinkami, np: homeoffice, warsaw, java)
                  </label>
                  <input
                    type="text"
                    value={tagsArrayToString(formData.tags)}
                    onChange={(e) => setFormData({
                      ...formData, 
                      tags: tagsStringToArray(e.target.value)
                    })}
                    className="w-full p-2 border rounded font-mono"
                    placeholder="homeoffice, warsaw, java"
                  />
                </div>

                <div>
                  <label className="font-mono block mb-2">URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full p-2 border rounded font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 font-mono"
                >
                  {currentApplication ? 'Zapisz zmiany' : 'Dodaj aplikację'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;