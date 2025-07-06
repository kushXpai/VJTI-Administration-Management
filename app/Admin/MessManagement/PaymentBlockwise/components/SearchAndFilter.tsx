import { FC } from 'react';

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  paymentStatus: string | null;
  setPaymentStatus: (value: string | null) => void;
  onFilter: () => void;
  loading: boolean;
}

const SearchAndFilter: FC<SearchAndFilterProps> = ({
  searchTerm,
  setSearchTerm,
  paymentStatus,
  setPaymentStatus,
  onFilter,
  loading,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Filter and Search</h3>
      <div className="flex flex-wrap gap-4 items-center">
        <label className="font-medium">
          Search:
          <input
            type="text"
            className="ml-2 border rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-[#800000] focus:border-[#800000] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Student ID, Name, or CET ID"
          />
        </label>
        <label className="font-medium">
          Payment Status:
          <select
            className="ml-2 border rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-[#800000] focus:border-[#800000] transition-all"
            value={paymentStatus || ''}
            onChange={(e) => setPaymentStatus(e.target.value || null)}
          >
            <option value="">All</option>
            <option value="fully_paid">Fully Paid</option>
            <option value="pending">Pending</option>
          </select>
        </label>
        <button
          onClick={onFilter}
          className="bg-gradient-to-r from-[#800000] to-[#a00000] text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition-all font-semibold"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Apply Filter'}
        </button>
      </div>
    </div>
  );
};

export default SearchAndFilter;