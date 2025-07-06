import { DetailedSummaryData } from '../types';

const StudentTable = ({ students, onViewReceipt }: { students: DetailedSummaryData[]; onViewReceipt: (url: string) => void; }) => {
  const formatCurrency = (amount: number | null | undefined) => `₹${(amount ?? 0).toLocaleString()}`;

  return (
    <table className="min-w-full text-sm border-collapse">
      <thead>
        <tr className="bg-[#800000] text-white">
          <th className="p-3 border-r border-white text-left">Student ID</th>
          <th className="p-3 border-r border-white text-left">Student Name</th>
          <th className="p-3 border-r border-white text-right">Hostel Fee</th>
          <th className="p-3 border-r border-white text-right">Fees Paid</th>
          <th className="p-3 border-r border-white text-right">Fees Pending</th>
          <th className="p-3 text-center">Receipt</th>
        </tr>
      </thead>
      <tbody>
        {students.map((row, idx) => (
          <tr key={row.student_id} className={`transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
            <td className="p-2 border-b text-left">{row.student_id ||'N/A'}</td>
            <td className="p-2 border-b text-left">{row.student_name ||'N/A'}</td>
            <td className="p-2 border-b text-right text-green-700">{formatCurrency(row.hostel_fee)}</td>
            <td className="p-2 border-b text-right text-green-700">{formatCurrency(row.fees_paid)}</td>
            <td className="p-2 border-b text-right text-red-700">{formatCurrency(row.fees_pending)}</td>
            <td className="p-2 border-b text-center">
              {row.receipt !== 'No receipt' ? (
                <button onClick={() => onViewReceipt(row.receipt)} className="px-2 py-1 bg-[#7C0A02] text-white rounded hover:bg-[#5E0701]">View</button>
              ) : 'No receipt'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StudentTable;
