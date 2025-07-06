import { useState } from 'react';
import { useStudentSearch } from '../hooks/useStudentSearch';
import { StudentResult } from '../types';

type SearchComponentProps = {
  onSwap: (students: StudentResult[]) => void;
  onChangeRoom: (student: StudentResult) => void;
};

export const SearchComponent = ({ onSwap, onChangeRoom }: SearchComponentProps) => {
  const { results, loading, error, searchStudents } = useStudentSearch();
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<StudentResult[]>([]);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    searchStudents(searchTerm);
    console.log('Searching for:', searchTerm);
  };

  const handleSelect = (student: StudentResult) => {
    const isSelected = selected.some((s) => s.id === student.id);
    if (isSelected) {
      setSelected((prev) => prev.filter((s) => s.id !== student.id));
    } else if (selected.length < 2) {
      setSelected((prev) => [...prev, student]);
    }
  };

  const handleSwapClick = () => {
    if (selected.length === 2) {
      onSwap(selected);
    }
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="flex mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, CET ID, or hostel"
          className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C0A02]"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="ml-2 bg-[#7C0A02] text-white px-4 py-2 rounded-md hover:bg-[#5E0701] disabled:bg-gray-400 transition-all duration-150"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((student) => {
          const isSelected = selected.some((s) => s.id === student.id);
          return (
            <div
              key={student.id}
              className={`border rounded-lg p-4 shadow-sm transition-transform duration-200 ${
                isSelected
                  ? 'border-[#7C0A02] bg-[#FBE9E7] shadow-lg transform scale-[1.02]'
                  : 'bg-white hover:shadow-md'
              }`}
            >
              <div className="mb-3 text-gray-800 text-sm">
                <div><strong>{student.name}</strong></div>
                <div>CET ID: {student.cet_application_id}</div>
                <div>Building: {student.building_name ?? 'N/A'}</div>
                <div>Room: {student.room_number ?? 'N/A'}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSelect(student)}
                  className={`flex-1 py-1 ${
                    isSelected ? 'bg-[#5E0701]' : 'bg-[#7C0A02]'
                  } text-white rounded-md hover:bg-[#5E0701] transition-all duration-150`}
                >
                  {isSelected ? 'Deselect' : 'Select'}
                </button>

                <button
                  onClick={() => onChangeRoom(student)}
                  className="flex-1 py-1 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701] transition-all duration-150"
                >
                  Change Room
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Swap Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSwapClick}
          disabled={selected.length !== 2}
          className="px-6 py-3 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701] disabled:bg-gray-400 transition-all duration-200"
        >
          Swap Selected
        </button>
      </div>
    </div>
  );
};
