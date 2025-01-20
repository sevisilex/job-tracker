import React from 'react';
import { Plus, RotateCcw, Archive, Download, Search, Upload } from 'lucide-react';
import { exportApplications, importApplications } from '@/lib/db';

interface HeaderProps {
  showArchived: boolean;
  searchTerm: string;
  isApplied: boolean;
  isRejected: boolean;
  onSearchChange: (value: string) => void;
  onArchiveToggle: () => void;
  onAddNew: () => void;
  onToggleApplied: () => void;
  onToggleRejected: () => void;
}

const Header: React.FC<HeaderProps> = ({
  showArchived,
  searchTerm,
  isApplied,
  isRejected,
  onSearchChange,
  onArchiveToggle,
  onAddNew,
  onToggleApplied,
  onToggleRejected
}) => {

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importApplications(file);
      alert(`Zaimportowano ${result.imported} aplikacji, pominięto ${result.skipped} aplikacji.`);
      window.location.reload(); // Odśwież stronę aby pokazać zaimportowane dane
    } catch (error) {
      alert('Błąd podczas importowania: ' + (error as Error).message);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-mono font-bold">
            {showArchived ? 'Zarchiwizowane Aplikacje' : 'Lista Aplikacji o Pracę'}
          </h1>
          <div className="flex gap-4 mt-2">
            <button
              onClick={onArchiveToggle}
              className="text-blue-500 hover:text-blue-700 font-mono flex items-center gap-2"
            >
              {showArchived ? <RotateCcw size={16} /> : <Archive size={16} />}
              {showArchived ? 'Powrót do aktywnych' : 'Pokaż zarchiwizowane'}
            </button>
            <button
              onClick={exportApplications}
              className="text-blue-500 hover:text-blue-700 font-mono flex items-center gap-2"
            >
              <Download size={16} />
              Eksportuj wszystko
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-500 hover:text-blue-700 font-mono flex items-center gap-2"
            >
              <Upload size={16} />
              Importuj
            </button>
          </div>
        </div>
        {!showArchived && (
          <button
            onClick={onAddNew}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 font-mono"
          >
            <Plus size={20} />
            Dodaj
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Szukaj w tytułach, tagach, lokalizacji..."
            className="w-full p-2 pl-10 border rounded font-mono"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {!showArchived && (
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 font-mono">
            <input
              type="checkbox"
              checked={isApplied}
              onChange={onToggleApplied}
              className="form-checkbox h-4 w-4 text-blue-500"
            />
            Aplikowane
          </label>
          <label className="flex items-center gap-2 font-mono">
            <input
              type="checkbox"
              checked={isRejected}
              onChange={onToggleRejected}
              className="form-checkbox h-4 w-4 text-blue-500"
            />
            Odrzucone
          </label>
        </div>
      )}
    </>
  );
};

export default Header;