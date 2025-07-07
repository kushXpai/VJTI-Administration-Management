// interface StudentSearchInputProps {
//   onSearch: (term: string) => void;
//   loading: boolean;
//   searchTerm: string;
//   setSearchTerm: (term: string) => void;
// }

// export default function StudentSearchInput({ onSearch, loading, searchTerm, setSearchTerm }: StudentSearchInputProps) {
//   const handleSearch = () => {
//     if (searchTerm.trim()) {
//       onSearch(searchTerm.trim());
//     }
//   };

//   return (
//     <div className="flex space-x-2">
//       <input
//         type="text"
//         placeholder="Search by Student ID, CET Application ID, or Name..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C0A02]"
//         disabled={loading}
//       />
//       <button
//         onClick={handleSearch}
//         disabled={loading || !searchTerm.trim()}
//         className="px-4 py-2 bg-[#7C0A02] text-white rounded-lg hover:bg-[#5E0701] disabled:bg-gray-400 disabled:cursor-not-allowed"
//       >
//         {loading ? "Searching..." : "Search"}
//       </button>
//     </div>
//   );
// }

// Fixed 🔧: Removed unused `useState` import

interface StudentSearchInputProps {
    onSearch: (term: string) => void;
    loading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
  }
  
  export default function StudentSearchInput({ onSearch, loading, searchTerm, setSearchTerm }: StudentSearchInputProps) {
    const handleSearch = () => {
      if (searchTerm.trim()) {
        onSearch(searchTerm.trim());
      }
    };
  
    return (
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Search by Student ID, CET Application ID, or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C0A02]"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !searchTerm.trim()}
          className="px-4 py-2 bg-[#7C0A02] text-white rounded-lg hover:bg-[#5E0701] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
    );
  }
  