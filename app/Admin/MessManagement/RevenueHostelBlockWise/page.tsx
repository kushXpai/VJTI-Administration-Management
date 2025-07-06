// "use client"; // Mark as Client Component

// import { useState, useEffect } from "react";
// import { createClient } from "@supabase/supabase-js";
// import Header from "@/app/Components/Header";
// import Footer from "@/app/Components/Footer";

// // Initialize Supabase client (replace with your Supabase URL and anon key)
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// interface DetailedSummaryData {
//   hostel_name: string;
//   student_id: string;
//   student_name: string;
//   hostel_fee: number | null;
//   fees_paid: number | null;
//   fees_pending: number | null;
//   receipt: string;
// }

// export default function Home() {
//   const [summaryData, setSummaryData] = useState<DetailedSummaryData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);
//     const { data, error: fetchError } = await supabase.rpc("get_hostel_detailed_summary");
//     if (fetchError) {
//       console.error("Error fetching detailed summary:", fetchError.message, fetchError.details);
//       setError(`Failed to fetch detailed summary: ${fetchError.message}`);
//     } else {
//       console.log("Fetched detailed summary data:", data); // Debug log
//       setSummaryData(data || []);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const formatCurrency = (amount: number | null | undefined) => {
//     const safeAmount = amount ?? 0;
//     return `₹${safeAmount.toLocaleString()}`;
//   };

//   const handleViewReceipt = (url: string) => {
//     if (url !== "No receipt" && url) {
//       window.open(url, "_blank", "noopener,noreferrer");
//     }
//   };

//   const toggleSection = (hostelName: string) => {
//     setExpandedSections((prev) => ({
//       ...prev,
//       [hostelName]: !prev[hostelName],
//     }));
//   };

//   const groupedData = summaryData.reduce((acc, row) => {
//     if (!acc[row.hostel_name]) acc[row.hostel_name] = [];
//     acc[row.hostel_name].push(row);
//     return acc;
//   }, {} as Record<string, DetailedSummaryData[]>);

//   // Calculate summary totals
//   const totalStudents = Object.values(groupedData).reduce((sum, students) => sum + students.length, 0);
//   const totalHostelFees = Object.values(groupedData).reduce((sum, students) => sum + (students[0]?.hostel_fee || 0) * students.length, 0);
//   const totalFeesPaid = summaryData.reduce((sum, row) => sum + (row.fees_paid || 0), 0);
//   const totalFeesPending = summaryData.reduce((sum, row) => sum + (row.fees_pending || 0), 0);

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-200 text-black">
//       <div className="flex-1 flex flex-col">
//         <main className="flex-1 p-6">
//           <Header
//             rightContent={
//               <div className="flex flex-col items-end">
//                 <span className="text-2xl font-extrabold text-[#800000] tracking-tight drop-shadow-sm">
//                   Hostel Detailed Revenue Dashboard
//                 </span>
//                 <span className="text-base text-gray-500 font-medium">
//                   Student-Wise Summary
//                 </span>
//               </div>
//             }
//           />
//           {loading ? (
//             <div className="text-center py-10 text-gray-600">Loading...</div>
//           ) : error ? (
//             <div className="text-center py-10 text-red-600">{error}</div>
//           ) : Object.keys(groupedData).length === 0 ? (
//             <div className="text-center py-10 text-gray-500">
//               No detailed revenue data available.
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {Object.entries(groupedData).map(([hostelName, students]) => {
//                 const totalFeesCollected = students.reduce((sum, row) => sum + (row.fees_paid || 0), 0);
//                 const totalFeesPending = students.reduce((sum, row) => sum + (row.fees_pending || 0), 0);
//                 return (
//                   <div key={hostelName} className="overflow-hidden rounded-lg">
//                     <div
//                       className="flex justify-between items-center p-3 bg-gradient-to-r from-[#800000] to-[#A52A2A] text-white cursor-pointer"
//                       onClick={() => toggleSection(hostelName)}
//                     >
//                       <span className="font-semibold">{hostelName} (Total Students: {students.length})</span>
//                       <span className="text-xl font-bold">
//                         {expandedSections[hostelName] ? "-" : "+"}
//                       </span>
//                     </div>
//                     {expandedSections[hostelName] && (
//                       <div className="p-4 bg-white border border-t-0 rounded-b-lg">
//                         <table className="min-w-full text-sm border-collapse">
//                           <thead>
//                             <tr className="bg-[#800000] text-white">
//                               <th className="p-3 border-r border-white text-left">Student ID</th>
//                               <th className="p-3 border-r border-white text-left">Student Name</th>
//                               <th className="p-3 border-r border-white text-right">Hostel Fee</th>
//                               <th className="p-3 border-r border-white text-right">Fees Paid</th>
//                               <th className="p-3 border-r border-white text-right">Fees Pending</th>
//                               <th className="p-3 text-center">Receipt</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {students.map((row, idx) => (
//                               <tr
//                                 key={row.student_id}
//                                 className={`transition-colors duration-200 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
//                               >
//                                 <td className="p-2 border-b text-left">{row.student_id}</td>
//                                 <td className="p-2 border-b text-left">{row.student_name}</td>
//                                 <td className="p-2 border-b text-right font-semibold text-green-700">
//                                   {formatCurrency(row.hostel_fee)}
//                                 </td>
//                                 <td className="p-2 border-b text-right font-semibold text-green-700">
//                                   {formatCurrency(row.fees_paid)}
//                                 </td>
//                                 <td className="p-2 border-b text-right font-semibold text-red-700">
//                                   {formatCurrency(row.fees_pending)}
//                                 </td>
//                                 <td className="p-2 border-b text-center">
//                                   {row.receipt !== "No receipt" ? (
//                                     <button
//                                       onClick={() => handleViewReceipt(row.receipt)}
//                                       className="px-2 py-1 bg-[#7C0A02] text-white rounded hover:bg-[#5E0701]"
//                                     >
//                                       View
//                                     </button>
//                                   ) : (
//                                     "No receipt"
//                                   )}
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                         <div className="mt-4 p-2 bg-gray-100 rounded">
//                           <div className="flex justify-between">
//                             <span className="font-semibold">Total Students:</span>
//                             <span className="font-semibold">{students.length}</span>
//                           </div>
//                           <div className="flex justify-between mt-2">
//                             <span className="font-semibold">Total Fees Collected:</span>
//                             <span className="text-green-700 font-semibold">
//                               {formatCurrency(totalFeesCollected)}
//                             </span>
//                           </div>
//                           <div className="flex justify-between mt-2">
//                             <span className="font-semibold">Total Fees Pending:</span>
//                             <span className="text-red-700 font-semibold">
//                               {formatCurrency(totalFeesPending)}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//               {/* Summary Section */}
//               <div className="mt-6 overflow-hidden rounded-lg shadow-md">
//                 <div className="p-3 bg-gradient-to-r from-[#800000] to-[#A52A2A] text-white">
//                   <span className="font-semibold">Overall Summary</span>
//                 </div>
//                 <div className="p-4 bg-white border border-t-0 rounded-b-lg">
//                   <table className="min-w-full text-sm border-collapse">
//                     <tbody>
//                       <tr className="bg-gray-50">
//                         <td className="p-2 border-b font-semibold text-left">Total Students</td>
//                         <td className="p-2 border-b text-right">{totalStudents}</td>
//                       </tr>
//                       <tr>
//                         <td className="p-2 border-b font-semibold text-left">Total Hostel Fees</td>
//                         <td className="p-2 border-b text-right font-semibold text-green-700">
//                           {formatCurrency(totalHostelFees)}
//                         </td>
//                       </tr>
//                       <tr className="bg-gray-50">
//                         <td className="p-2 border-b font-semibold text-left">Total Fees Paid</td>
//                         <td className="p-2 border-b text-right font-semibold text-green-700">
//                           {formatCurrency(totalFeesPaid)}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td className="p-2 border-b font-semibold text-left">Total Fees Pending</td>
//                         <td className="p-2 border-b text-right font-semibold text-red-700">
//                           {formatCurrency(totalFeesPending)}
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//       <Footer />
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import Header from '@/app/Components/Header';
import Footer from '@/app/Components/Footer';
import DashboardHeader from './components/DashboardHeader';
import CollapsibleSection from './components/CollapsibleSection';
import SummaryCard from './components/SummaryCard';
import { useDetailedSummary } from './hooks/useDetailedSummary';

export default function DashboardPage() {
  const { summaryData, loading, error } = useDetailedSummary();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const handleViewReceipt = (url: string) => {
    if (url !== 'No receipt') window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleSection = (hostelName: string) => {
    setExpandedSections(prev => ({ ...prev, [hostelName]: !prev[hostelName] }));
  };

  const groupedData = summaryData.reduce((acc, row) => {
    if (!acc[row.hostel_name]) acc[row.hostel_name] = [];
    acc[row.hostel_name].push(row);
    return acc;
  }, {} as Record<string, typeof summaryData>);

  const totalStudents = Object.values(groupedData).reduce((sum, students) => sum + students.length, 0);
  const totalHostelFees = Object.values(groupedData).reduce((sum, students) => sum + (students[0]?.hostel_fee || 0) * students.length, 0);
  const totalFeesPaid = summaryData.reduce((sum, row) => sum + (row.fees_paid || 0), 0);
  const totalFeesPending = summaryData.reduce((sum, row) => sum + (row.fees_pending || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-200 text-black">
      <Header />
      <main className="flex-1 p-6">
        <DashboardHeader />
        {loading ? <div className="text-center py-10">Loading...</div> :
          error ? <div className="text-center py-10 text-red-600">{error}</div> :
            <div className="space-y-4">
              {Object.entries(groupedData).map(([hostel, students]) => (
                <CollapsibleSection
                  key={hostel}
                  hostelName={hostel}
                  students={students}
                  isOpen={!!expandedSections[hostel]}
                  toggleSection={() => toggleSection(hostel)}
                  onViewReceipt={handleViewReceipt}
                />
              ))}
              <SummaryCard
                totalStudents={totalStudents}
                totalHostelFees={totalHostelFees}
                totalFeesPaid={totalFeesPaid}
                totalFeesPending={totalFeesPending}
              />
            </div>
        }
      </main>
      <Footer />
    </div>
  );
}
