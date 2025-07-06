"use client";

import { useState, useEffect } from "react";
import { useRevenueData } from "./hooks/useRevenueData";
import CollapsibleSection from "./components/CollapsileSection";
import RevenueTable from "./components/RevenueTable";
import RevenueSummaryTable from "./components/RevenueSummaryTable";
import Header from "@/app/Components/Header";
import Footer from "@/app/Components/Footer";

export default function Home() {
  const { revenueData, summaryData, loading, fetchRevenueData, notification } = useRevenueData();

  useEffect(() => {
    fetchRevenueData({ startDate: "2023-01-01", endDate: "2023-12-31" });
  }, []);

  const calculateMessRevenue = (block: string) => {
    return summaryData.find(s => s.mess_block === block)?.total_assigned || 0;
  };

  const calculateMessStudents = (block: string) => {
    return summaryData.find(s => s.mess_block === block)?.student_count || 0;
  };

  const getRevenueByMessBlock = (block: string) => {
    return revenueData.filter(r => r.mess_block === block);
  };

  const handleViewReceipt = (url: string) => {
    if (url && url !== "No receipt") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-200 text-black">
      <div className="flex-1 flex flex-row">
        <main className="flex-1 p-8">
          <Header
            rightContent={
              <div className="flex flex-col items-end">
                <span className="text-2xl font-extrabold text-[#800000] tracking-tight drop-shadow-sm">
                  Mess Revenue Management
                </span>
                <span className="text-base text-gray-500 font-medium">Block-wise Revenue</span>
              </div>
            }
          />

          <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm flex items-center justify-center py-2 px-4 gap-4 md:gap-8 mb-6">
            <a href="#mess1-section" className="px-3 py-1 rounded-lg font-semibold text-gray-900 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500">Mess 1</a>
            <a href="#mess2-section" className="px-3 py-1 rounded-lg font-semibold text-gray-900 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500">Mess 2</a>
            <a href="#mess3-section" className="px-3 py-1 rounded-lg font-semibold text-gray-900 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500">Mess 3</a>
            <a href="#summary-section" className="px-3 py-1 rounded-lg font-semibold text-gray-900 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500">Revenue Summary</a>
          </nav>

          {notification && (
            <div className={`mb-4 p-3 rounded-lg shadow text-center font-semibold transition-all duration-300 ${
              notification.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {notification.message}
            </div>
          )}

          <div className="flex flex-col gap-8 mt-6">

            <div id="mess1-section">
              <CollapsibleSection
                title="C-Block"
                subtitle={`₹${calculateMessRevenue('C Block')} (${calculateMessStudents('C Block')} students)`}
                colorClass="bg-gradient-to-r from-[#800000] to-[#A52A2A]"
              >
                <RevenueTable revenueData={getRevenueByMessBlock('C Block')} loading={loading} handleViewReceipt={handleViewReceipt} />
              </CollapsibleSection>
            </div>

            <div id="mess2-section">
              <CollapsibleSection
                title="D-Block"
                subtitle={`₹${calculateMessRevenue('D Block')} (${calculateMessStudents('D Block')} students)`}
                colorClass="bg-gradient-to-r from-[#800000] to-[#A52A2A]"
              >
                <RevenueTable revenueData={getRevenueByMessBlock('D Block')} loading={loading} handleViewReceipt={handleViewReceipt} />
              </CollapsibleSection>
            </div>

            <div id="mess3-section">
              <CollapsibleSection
                title="E-Block"
                subtitle={`₹${calculateMessRevenue('E Block')} (${calculateMessStudents('E Block')} students)`}
                colorClass="bg-gradient-to-r from-[#800000] to-[#A52A2A]"
              >
                <RevenueTable revenueData={getRevenueByMessBlock('E Block')} loading={loading} handleViewReceipt={handleViewReceipt} />
              </CollapsibleSection>
            </div>

            <div id="summary-section">
              <CollapsibleSection
                title="Revenue Summary"
                colorClass="bg-gradient-to-r from-[#800000] to-[#A52A2A]"
              >
                <RevenueSummaryTable summaryData={summaryData} />
              </CollapsibleSection>
            </div>

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}