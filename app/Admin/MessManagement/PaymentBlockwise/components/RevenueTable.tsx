// RevenueTable.tsx
import React from "react";

interface RevenueTableProps {
  revenueData: any[];
  loading: boolean;
  handleViewReceipt: (url: string) => void;
}

const RevenueTable: React.FC<RevenueTableProps> = ({ revenueData, loading, handleViewReceipt }) => {
  if (loading) {
    return <div className="text-center py-6 text-gray-500">Loading...</div>;
  }

  if (!revenueData.length) {
    return <div className="text-center py-6 text-gray-500">No data available.</div>;
  }

  return (
    <table className="min-w-full text-sm border-collapse rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-gradient-to-r from-[#800000] to-[#A52A2A] text-white">
          <th className="p-3 border-r border-white text-left">Student ID</th>
          <th className="p-3 border-r border-white text-left">Name</th>
          <th className="p-3 border-r border-white text-left">Mess Block</th>
          <th className="p-3 border-r border-white text-right">Fees</th>
          <th className="p-3 border-r border-white text-right">Paid</th>
          <th className="p-3 border-r border-white text-right">Pending</th>
          <th className="p-3 text-center">Receipt</th>
        </tr>
      </thead>
      <tbody>
        {revenueData.map((row, idx) => (
          <tr key={row.student_id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
            <td className="p-2 border-b text-left text-xs text-gray-600">{row.student_id}</td>
            <td className="p-2 border-b text-left font-medium">{row.name}</td>
            <td className="p-2 border-b text-left">{row.mess_block}</td>
            <td className="p-2 border-b text-right font-semibold text-green-700">₹{row.mess_fees?.toLocaleString()}</td>
            <td className="p-2 border-b text-right font-semibold text-green-700">₹{row.mess_feed_paid?.toLocaleString()}</td>
            <td className="p-2 border-b text-right font-semibold text-red-700">₹{row.mess_feed_pending?.toLocaleString()}</td>
            <td className="p-2 border-b text-center">
              {row.mess_fees_url !== "No receipt" ? (
                <button
                  onClick={() => handleViewReceipt(row.mess_fees_url)}
                  className="px-3 py-1 bg-[#800000] text-white rounded hover:bg-[#5E0701] text-sm"
                >
                  View
                </button>
              ) : (
                <span className="text-gray-500 text-xs">No receipt</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RevenueTable;
