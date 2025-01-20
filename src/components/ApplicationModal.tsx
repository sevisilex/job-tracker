import React from 'react';
import { X } from 'lucide-react';
import { JobApplication, FormData, tagsStringToArray, tagsArrayToString } from '../types';

interface ApplicationModalProps {
  isOpen: boolean;
  currentApplication: JobApplication | null;
  formData: FormData;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: FormData) => void;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  currentApplication,
  formData,
  onClose,
  onSubmit,
  onFormDataChange,
}) => {
  const predefinedTags = [
    ['typescript', 'vue', 'react', 'angular', 'node', 'aws', 'nuxt', 'next', 'java', 'c#', 'c++', 'mongodb', 'prisma', 'docker', 'php', 'laravel', 'mysql'].sort(),
    ['agency', 'remote', 'hybrid', 'email', 'linkedin', 'xing', 'myability', 'stepstone', 'disabled'],
  ];

  const addTag = (newTag: string) => {
    if (!formData.tags.includes(newTag)) {
      onFormDataChange({
        ...formData,
        tags: [...formData.tags, newTag]
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-4/5 max-h-screen overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-mono font-bold">
            {currentApplication ? 'Edytuj aplikację' : 'Nowa aplikacja'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="font-mono block mb-2">Tytuł</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded font-mono"
              required
            />
          </div>

          <div>
            <label className="font-mono block mb-2">Opis</label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded font-mono h-32"
              maxLength={10000}
            />
          </div>

          <div>
            <label className="font-mono block mb-2">Lokalizacja</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => {
                const cursorPosition = e.target.selectionStart;
                onFormDataChange({ ...formData, location: e.target.value.toLowerCase() });
                setTimeout(() => {
                  e.target.setSelectionRange(cursorPosition, cursorPosition);
                }, 0);
              }}
              className="w-full p-2 border rounded font-mono"
            />
          </div>

          <div>
            <label className="font-mono block mb-2">
              Tagi
            </label>
            <input
              type="text"
              value={tagsArrayToString(formData.tags)}
              onChange={(e) => {
                const cursorPosition = e.target.selectionStart;
                onFormDataChange({
                  ...formData,
                  tags: tagsStringToArray(e.target.value)
                });
                setTimeout(() => {
                  e.target.setSelectionRange(cursorPosition, cursorPosition);
                }, 0);
              }}
              className="w-full p-2 border rounded font-mono"
              placeholder="homeoffice, warsaw, java"
            />
            <div className="mt-2 space-y-2">
              {predefinedTags.map((tagGroup, groupIndex) => (
                <div key={groupIndex} className="flex flex-wrap gap-2">
                  {tagGroup
                    .filter(tag => !formData.tags.includes(tag))
                    .map((tag, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-mono text-xs py-1 px-3 rounded-full"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono block mb-2">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => onFormDataChange({ ...formData, url: e.target.value })}
              className="w-full p-2 border rounded font-mono"
            />
            <input
              type="url"
              value={formData.url2 || ''}
              onChange={(e) => onFormDataChange({ ...formData, url2: e.target.value || null })}
              className="w-full p-2 border rounded font-mono"
            />
          </div>

          {currentApplication?.rejectedAt &&
            <div>
              <label className="font-mono block mb-2">Powód odrzucenia</label>
              <input
                type="text"
                value={formData.rejectedReason || ''}
                onChange={(e) => onFormDataChange({ ...formData, rejectedReason: e.target.value })}
                className="w-full p-2 border rounded font-mono"
              />
            </div>
          }

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 font-mono"
          >
            {currentApplication ? 'Zapisz zmiany' : 'Dodaj aplikację'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;