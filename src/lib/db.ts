import { JobApplication } from '../types';

export const initDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sv_job-tracker', 3);
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
        store.createIndex('archivedAt', 'archivedAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
};

export const getAllApplications = async (): Promise<JobApplication[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['applications'], 'readonly');
    const store = transaction.objectStore('applications');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveApplication = async (application: JobApplication): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['applications'], 'readwrite');
    const store = transaction.objectStore('applications');
    
    const request = application.id ? store.put(application) : store.add(application);
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const updateApplicationStatus = async (id: number, updates: Partial<JobApplication>): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['applications'], 'readwrite');
    const store = transaction.objectStore('applications');
    
    const request = store.get(id);
    request.onsuccess = () => {
      const application = request.result;
      const updatedApplication = { ...application, ...updates };
      store.put(updatedApplication);
    };
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const deleteApplication = async (id: number): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['applications'], 'readwrite');
    const store = transaction.objectStore('applications');
    
    const request = store.delete(id);
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const exportApplications = async (): Promise<void> => {
  const applications = await getAllApplications();
  const data = JSON.stringify(applications, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'job-applications.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};