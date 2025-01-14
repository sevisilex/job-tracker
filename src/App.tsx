import React, { useState, useEffect, FormEvent } from 'react';
import { X, Edit2, Plus } from 'lucide-react';

interface JobApplication {
  id?: number;
  title: string;
  description: string;
  location: string;
  tags: string[];  // Zmienione z 'tag' na 'tags' jako tablica
  url: string;
  appliedAt: string;
  rejectedAt: string | null;
}

type FormData = Omit<JobApplication, 'id' | 'appliedAt' | 'rejectedAt'>;

const initDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('JobApplicationsDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('applications')) {
        const store = db.createObjectStore('applications', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        
        store.createIndex('title', 'title', { unique: false });
        store.createIndex('appliedAt', 'appliedAt', { unique: false });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
  });
};

const App: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<JobApplication | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    tags: [],  // Inicjalizacja jako pusta tablica
    url: '',
  });

  // Helper do konwersji tagów ze stringa na tablicę
  const tagsStringToArray = (tagsStr: string): string[] => {
    return tagsStr
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag !== '');
  };

  // Helper do konwersji tagów z tablicy na string
  const tagsArrayToString = (tags: string[]): string => {
    return tags.join(', ');
  };

  useEffect(() => {
    const loadApplications = async () => {
      const db = await initDB();
      const transaction = db.transaction(['applications'], 'readonly');
      const store = transaction.objectStore('applications');
      const request = store.getAll();
      
      request.onsuccess = () => {
        setApplications(request.result);
      };
    };
    
    loadApplications();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const db = await initDB();
    const transaction = db.transaction(['applications'], 'readwrite');
    const store = transaction.objectStore('applications');
    
    const application: JobApplication = {
      ...formData,
      appliedAt: currentApplication?.appliedAt || new Date().toISOString(),
      rejectedAt: currentApplication?.rejectedAt || null,
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
      
      const refreshTransaction = db.transaction(['applications'], 'readonly');
      const refreshStore = refreshTransaction.objectStore('applications');
      const request = refreshStore.getAll();
      
      request.onsuccess = () => {
        setApplications(request.result);
      };
    };
  };

  const handleReject = async (id: number) => {
    const db = await initDB();
    const transaction = db.transaction(['applications'], 'readwrite');
    const store = transaction.objectStore('applications');
    
    const request = store.get(id);
    request.onsuccess = () => {
      const application = request.result;
      application.rejectedAt = new Date().toISOString();
      store.put(application);
    };
    
    transaction.oncomplete = () => {
      const refreshTransaction = db.transaction(['applications'], 'readonly');
      const refreshStore = refreshTransaction.objectStore('applications');
      const refreshRequest = refreshStore.getAll();
      
      refreshRequest.onsuccess = () => {
        setApplications(refreshRequest.result);
      };
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-mono font-bold">Lista Aplikacji o Pracę</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={20} />
            Dodaj
          </button>
        </div>

        <div className="space-y-4">
          {applications.map((app) => (
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
                    Aplikowano: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                  {app.rejectedAt && (
                    <p className="font-mono text-sm text-red-500">
                      Odrzucono: {new Date(app.rejectedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const formDataWithTagsString = {
                        ...app,
                        tags: app.tags
                      };
                      setCurrentApplication(app);
                      setFormData(formDataWithTagsString);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-600 hover:text-blue-500"
                  >
                    <Edit2 size={20} />
                  </button>
                  {!app.rejectedAt && app.id && (
                    <button
                      onClick={() => handleReject(app.id!)}
                      className="p-2 text-gray-600 hover:text-red-500"
                    >
                      <X size={20} />
                    </button>
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