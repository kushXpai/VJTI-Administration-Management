import { DetailedSummaryData } from '../types';
import StudentTable from './StudentTable';

const CollapsibleSection = ({
  hostelName,
  students,
  isOpen,
  toggleSection,
  onViewReceipt
}: {
  hostelName: string;
  students: DetailedSummaryData[];
  isOpen: boolean;
  toggleSection: () => void;
  onViewReceipt: (url: string) => void;
}) => {
  const totalFeesCollected = students.reduce((sum, row) => sum + (row.fees_paid || 0), 0);
  const totalFeesPending = students.reduce((sum, row) => sum + (row.fees_pending || 0), 0);

  const formatCurrency = (amount: number | null | undefined) => `₹${(amount ?? 0).toLocaleString()}`;

  return (
    <div className="overflow-hidden rounded-lg">
      <div
        className="flex justify-between items-center p-3 bg-gradient-to-r from-[#800000] to-[#A52A2A] text-white cursor-pointer"
        onClick={toggleSection}
      >
        <span className="font-semibold">{hostelName} (Total Students: {students.length})</span>
        <span className="text-xl font-bold">{isOpen ? '-' : '+'}</span>
      </div>
      {isOpen && (
        <div className="p-4 bg-white border border-t-0 rounded-b-lg">
          <StudentTable students={students} onViewReceipt={onViewReceipt} />
          <div className="mt-4 p-2 bg-gray-100 rounded">
            <div className="flex justify-between"><span className="font-semibold">Total Students:</span><span className="font-semibold">{students.length}</span></div>
            <div className="flex justify-between mt-2"><span className="font-semibold">Total Fees Collected:</span><span className="text-green-700 font-semibold">{formatCurrency(totalFeesCollected)}</span></div>
            <div className="flex justify-between mt-2"><span className="font-semibold">Total Fees Pending:</span><span className="text-red-700 font-semibold">{formatCurrency(totalFeesPending)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
