const INDEXDB_NAME = import.meta.env.VITE_INDEXDB_NAME || 'sv_job-tracker'

import { JobApplication } from '../types'

export const initDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INDEXDB_NAME, 4)
    request.onerror = () => reject(request.error)
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Jeśli istnieje stary store, usuń go
      if (db.objectStoreNames.contains('applications')) {
        if (!confirm('Uwaga update, czy mogę usuać stare dane?')) return
        db.deleteObjectStore('applications')
      }

      // Utwórz nowy store z createdAt jako kluczem
      const store = db.createObjectStore('applications', {
        keyPath: 'createdAt',
      })

      store.createIndex('title', 'title', { unique: false })
      store.createIndex('archivedAt', 'archivedAt', { unique: false })
    }
    request.onsuccess = () => resolve(request.result)
  })
}

export const getAllApplications = async (): Promise<JobApplication[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['applications'], 'readonly')
    const store = transaction.objectStore('applications')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const saveApplication = async (application: JobApplication): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['applications'], 'readwrite')
    const store = transaction.objectStore('applications')

    store.put(application)

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export const updateApplicationStatus = async (createdAt: string, updates: Partial<JobApplication>): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['applications'], 'readwrite')
    const store = transaction.objectStore('applications')

    const request = store.get(createdAt)
    request.onsuccess = () => {
      const application = request.result
      const updatedApplication = { ...application, ...updates }
      store.put(updatedApplication)
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export const deleteApplication = async (createdAt: string): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['applications'], 'readwrite')
    const store = transaction.objectStore('applications')

    store.delete(createdAt)

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export const exportApplications = async (): Promise<void> => {
  const applications = await getAllApplications()

  const cleanApplications = applications.map((app) => Object.fromEntries(Object.entries(app).filter(([, v]) => v != null)))
  const data = JSON.stringify(cleanApplications, null, 2)

  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'job-applications.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const importApplications = async (file: File): Promise<{ imported: number; skipped: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const applications: JobApplication[] = JSON.parse(e.target?.result as string)
        const db = await initDB()
        const transaction = db.transaction(['applications'], 'readwrite')
        const store = transaction.objectStore('applications')

        let imported = 0
        let skipped = 0

        for (const app of applications) {
          const existingApp = await new Promise<JobApplication | undefined>((resolve) => {
            const request = store.get(app.createdAt)
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => resolve(undefined)
          })

          if (existingApp) {
            const replace = confirm(`Aplikacja z datą ${app.createdAt} już istnieje. Czy chcesz ją zastąpić?`)
            if (replace) {
              store.put(app)
              imported++
            } else {
              skipped++
            }
          } else {
            store.put(app)
            imported++
          }
        }

        transaction.oncomplete = () => resolve({ imported, skipped })
        transaction.onerror = () => reject(transaction.error)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
