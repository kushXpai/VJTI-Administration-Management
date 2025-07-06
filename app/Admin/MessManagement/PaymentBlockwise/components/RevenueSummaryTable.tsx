import { FC } from 'react';
import { MessSummaryData } from '../types';

interface RevenueSummaryTableProps {
  summaryData: MessSummaryData[];
}

const RevenueSummaryTable: FC<RevenueSummaryTableProps> = ({ summaryData }) => {
  const totalStudents = summaryData.reduce((sum, row) => sum + row.student_count, 0);
  const totalAssigned = summaryData.reduce((sum, row) => sum + row.total_assigned, 0);
  const totalPaid = summaryData.reduce((sum, row) => sum + row.total_paid, 0);
  const totalPending = summaryData.reduce((sum, row) => sum + row.total_pending, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Overall Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Total Students:</span>
              <span className="font-bold text-blue-700 text-xl">{totalStudents}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Assigned:</span>
              <span className="font-bold text-green-700 text-xl">₹{totalAssigned.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Paid:</span>
              <span className="font-bold text-green-700 text-xl">₹{totalPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Pending:</span>
              <span className="font-bold text-red-700 text-xl">₹{totalPending.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="w-full border border-gray-400 text-sm bg-white rounded-xl">
          <thead className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200">
            <tr>
              <th className="p-3 border font-semibold">Mess Block</th>
              <th className="p-3 border font-semibold">Students</th>
              <th className="p-3 border font-semibold">Assigned</th>
              <th className="p-3 border font-semibold">Paid</th>
              <th className="p-3 border font-semibold">Pending</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((row) => (
              <tr key={row.mess_block} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 border font-medium">{row.mess_block}</td>
                <td className="p-3 border text-center font-semibold">{row.student_count}</td>
                <td className="p-3 border text-center font-semibold text-green-700">
                  ₹{row.total_assigned.toLocaleString()}
                </td>
                <td className="p-3 border text-center font-semibold text-green-700">
                  ₹{row.total_paid.toLocaleString()}
                </td>
                <td className="p-3 border text-center font-semibold text-red-700">
                  ₹{row.total_pending.toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold">
              <td className="p-3 border font-bold">Total</td>
              <td className="p-3 border text-center">{totalStudents}</td>
              <td className="p-3 border text-center text-green-800">₹{totalAssigned.toLocaleString()}</td>
              <td className="p-3 border text-center text-green-800">₹{totalPaid.toLocaleString()}</td>
              <td className="p-3 border text-center text-red-800">₹{totalPending.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueSummaryTable;