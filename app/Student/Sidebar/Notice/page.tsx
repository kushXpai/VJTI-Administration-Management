"use client";

import { useState, useEffect } from "react";
import Header from "@/app/Components/Header";
import Footer from "@/app/Components/Footer";
import { supabase } from "@/supabase/supabaseClient";

export default function GenerateNotice() {
  type Notice = {
    id: number;
    title: string;
    description: string;
    notice_url: string;
    created_at: string;
    updated_at: string;
  };
  const [notices, setNotices] = useState<Notice[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const fetchNotices = async (filter: string = "all") => {
    let fromDate: Date | null = null;

    const now = new Date();

    if (filter === "week") {
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - 7);
    } else if (filter === "month") {
      fromDate = new Date(now);
      fromDate.setMonth(now.getMonth() - 1);
    } else if (filter === "3months") {
      fromDate = new Date(now);
      fromDate.setMonth(now.getMonth() - 3);
    }

    let query = supabase.from("notices_db").select("*");

    if (fromDate) {
      query = query.gte("updated_at", fromDate.toISOString());
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching notices: ", error.message);
    } else {
      setNotices(data || []);
    }
  };

  useEffect(() => {
    fetchNotices(); // default fetch all on load
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto w-full py-6 px-4">
        <h1 className="text-2xl font-bold text-[#800000] mb-2">View Notices</h1>
        <div className="flex items-center justify-between">
          <p className="mx-3 font-medium text-xl">Filter Notices by time</p>
          <select className="w-fit bg-white font-medium mb-4 p-2 border-2 rounded-xl">
            <option value="all">All</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="3months">Last 3 Months</option>
          </select>
        </div>
      </div>
      {notices.map((notice) => (
        <div
          key={notice.id}
          className="w-[90%] mx-auto flex flex-col items-center justify-center"
        >
          <div
            onClick={() => toggleExpand(notice.id)}
            className="cursor-pointer text-xl w-[80%] bg-white border-black flex flex-col p-4 my-3 border rounded-xl shadow transition-all duration-300"
          >
            <div className="flex justify-between items-center">
              <p>
                <strong>{notice.title}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Updated at:{" "}
                {new Date(notice.updated_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedId === notice.id ? "max-h-[500px] mt-4" : "max-h-0"
              }`}
            >
              <div className="text-base text-gray-700 px-1">
                <p>{notice.description}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent collapsing if parent is clickable
                    window.open(notice.notice_url, "_blank");
                  }}
                  className="w-fit mt-4 text-sm px-4 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition duration-300 ease-in-out"
                >
                  Go to PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Footer />
    </div>
  );
}
