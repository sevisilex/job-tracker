import { X, Coffee, Heart } from 'lucide-react'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AboutModal = ({ isOpen, onClose }: AboutModalProps) => {
  if (!isOpen) return null

  return (
    <div className="font-mono fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold dark:text-white">About Job Applications List</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 dark:text-gray-300">
          <p className="text-sm">Version 1.1.8</p>

          <p>
            This open-source project serves as a portfolio demonstration. It helps users track and manage their job applications efficiently with a clean and
            intuitive interface.
          </p>

          <div>
            <h3 className="font-semibold mb-2">Key Features:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Track job applications and their status</li>
              {/* <li>Dark/Light theme support</li> */}
              <li>Data export/import functionality</li>
              <li>Search functionality</li>
              <li>Filter by status</li>
              <li>Calendar view</li>
              <li>Archive view</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Tech Stack:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>React + TypeScript</li>
              <li>TailwindCSS</li>
              <li>Lucide Icons</li>
              <li>Localstorage for settings</li>
              <li>IndexedDB for storage</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold">
              Coded by{' '}
              <a href="https://github.com/sevisilex/job-tracker" target="_blank" className="text-blue-500 hover:text-blue-700 hover:underline">
                Dariusz Krzeminski
              </a>
            </p>
          </div>

          <div className="text-center mt-6 border-t pt-6">
            <p className="mb-4">
              If you're happy with this project,
              <br />
              consider buying me a coffee! <Coffee size={20} className="inline-block " />
            </p>
            <a
              href="https://ko-fi.com/svslx"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex px-4 py-2 bg-yellow-400 text-black rounded hover:bg-black hover:text-white duration-300 transition-colors"
            >
              <span className="relative">
                <Coffee size={24} className="mr-2 transition-opacity duration-300 ease-in-out group-hover:opacity-0" />
                <Heart
                  size={24}
                  className="mr-2 text-red-500 absolute left-0 top-0 opacity-0 transition-all duration-300 ease-in-out scale-0 rotate-0 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-12"
                />
              </span>
              Buy me a coffee
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
