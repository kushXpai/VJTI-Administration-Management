// components/StudentSearch.tsx

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Student } from '../types';
import StudentInfoCard from './StudentInfoCard';

interface StudentSearchProps {
  onSearch: (query: string) => Promise<Student[]>;
  onSelectStudent: (student: Student) => void;
  loading: boolean;
  placeholder?: string;
}

const StudentSearch: React.FC<StudentSearchProps> = ({
  onSearch,
  onSelectStudent,
  loading,
  placeholder = "Search by student name or ID..."
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const results = await onSearch(searchQuery);
    setSearchResults(results);
  };

  const handleSelectStudent = (student: Student) => {
    onSelectStudent(student);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="mb-8">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !searchQuery.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Search Results:</h3>
          <div className="space-y-3">
            {searchResults.map((student) => (
              <StudentInfoCard
                key={student.id}
                student={student}
                onSelect={() => handleSelectStudent(student)}
                showSelectButton={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSearch;