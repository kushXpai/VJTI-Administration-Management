'use client';

interface StudentSearchInputProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void;
  loading: boolean;
}

const StudentSearchInput = ({ searchTerm, setSearchTerm, onSearch, loading }: StudentSearchInputProps) => {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Enter CET ID or name"
        className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />
      <button
        onClick={onSearch}
        disabled={loading}
        className="px-4 py-2 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701] disabled:bg-gray-400"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
};

export { StudentSearchInput };