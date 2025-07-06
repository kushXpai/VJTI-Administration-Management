const SummaryCard = ({ totalStudents, totalHostelFees, totalFeesPaid, totalFeesPending }: {
    totalStudents: number;
    totalHostelFees: number;
    totalFeesPaid: number;
    totalFeesPending: number;
  }) => {
    const formatCurrency = (amount: number | null | undefined) => `₹${(amount ?? 0).toLocaleString()}`;
  
    return (
      <div className="mt-6 overflow-hidden rounded-lg shadow-md">
        <div className="p-3 bg-gradient-to-r from-[#800000] to-[#A52A2A] text-white">
          <span className="font-semibold">Overall Summary</span>
        </div>
        <div className="p-4 bg-white border border-t-0 rounded-b-lg">
          <table className="min-w-full text-sm border-collapse">
            <tbody>
              <tr className="bg-gray-50"><td className="p-2 border-b font-semibold text-left">Total Students</td><td className="p-2 border-b text-right">{totalStudents}</td></tr>
              <tr><td className="p-2 border-b font-semibold text-left">Total Hostel Fees</td><td className="p-2 border-b text-right text-green-700">{formatCurrency(totalHostelFees)}</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border-b font-semibold text-left">Total Fees Paid</td><td className="p-2 border-b text-right text-green-700">{formatCurrency(totalFeesPaid)}</td></tr>
              <tr><td className="p-2 border-b font-semibold text-left">Total Fees Pending</td><td className="p-2 border-b text-right text-red-700">{formatCurrency(totalFeesPending)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default SummaryCard;
  