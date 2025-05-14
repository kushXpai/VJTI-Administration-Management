"use client";

import { useState } from "react";
import { supabase } from "@/supabase/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Define the Grievance interface (same as in GeneralComplaints)
interface Grievance {
  id: string;
  issue_text: string;
  student_id: string;
  created_at: string;
  status: "Pending" | "In Progress" | "Resolved" | "Rejected";
  is_opened: boolean;
  category: string;
  image_url?: string;
  resolved_at?: string | null;
  remark?: string | null;
}

export default function TrackComplaintStatus() {
  const [studentId, setStudentId] = useState("");
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Color scheme consistent with GeneralComplaints
  const colors = {
    primary: '#800000',
    primaryDark: '#5A0000',
    primaryLight: '#FFE6E6',
    surfaceLight: '#FFFFFF',
    surfaceDark: '#E0E0E0',
    textPrimary: '#000000',
    textSecondary: '#333333',
    textTertiary: '#777777',
    textInverse: '#FFFFFF',
    lightBlue: '#81D4FA',
    lightGreen: '#A5D6A7',
    lightRed: '#EF9A9A',
    lightYellow: '#FFF59D',
  };

  // Function to fetch grievances by student_id
  const fetchGrievances = async () => {
    if (!studentId.trim()) {
      setError("Please enter a valid Student ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setGrievances([]);

    try {
      const { data, error } = await supabase
        .from("grievances")
        .select("*")
        .eq("student_id", studentId.trim())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error fetching grievances:", error);
        throw new Error("No complaints found for this Student ID.");
      }

      if (data && data.length > 0) {
        console.log("Grievance image URLs:", data.map(g => g.image_url));
        setGrievances(data);
      } else {
        setError("No complaints found for this Student ID.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch complaints. Please try again.";
      console.error("Error fetching grievances:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to get status color (consistent with GeneralComplaints)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Function to get redirect URL based on category
  const getRedirectUrl = (category: string) => {
    switch (category) {
      case "General":
        return "/Admin/GrievancesManagement/GeneralComplaints";
      case "Hostel":
        return "/Admin/GrievancesManagement/HostelComplaints";
      case "Mess":
        return "/Admin/GrievancesManagement/MessComplaints";
      default:
        return "/Admin/GrievancesManagement/GeneralComplaints"; // Fallback
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGrievances();
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-8" style={{ color: colors.primary }}>
          Track Complaint Status
        </h1>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter Student ID"
              className="w-full sm:w-96 border p-3 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500"
            />
            <button
              type="submit"
              disabled={loading || studentId.trim() === ""}
              className={`px-6 py-3 rounded-lg text-white font-medium transition-all transform hover:scale-105 shadow-md ${
                loading || studentId.trim() === ""
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-maroon-700 hover:bg-maroon-800"
              }`}
              style={{ backgroundColor: loading || studentId.trim() === "" ? "" : colors.primary }}
            >
              {loading ? "Searching..." : "Track Complaints"}
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-center mt-4">{error}</p>
          )}
        </form>

        {/* Grievances List */}
        {grievances.length > 0 && (
          <div className="p-6 bg-gray-50 rounded-lg border">
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>
              Complaint Details
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {grievances.map((grievance) => (
                <div key={grievance.id} className="p-5 bg-white rounded-lg border shadow-sm">
                  <div className="p-4 bg-white rounded-lg border mb-4">
                    <p className="font-medium mb-2">Issue:</p>
                    <p className="text-gray-700">{grievance.issue_text}</p>
                  </div>

                  {grievance.image_url && (
                    <div className="mb-6">
                      <p className="font-medium mb-2">Attached Image:</p>
                      <Image
                        src={grievance.image_url}
                        alt="Complaint image"
                        width={500}
                        height={300}
                        className="rounded-lg"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">Complaint ID:</p>
                      <p>{grievance.id}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">Submitted on:</p>
                      <p>{new Date(grievance.created_at).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">Current Status:</p>
                      <span
                        className={`inline-block px-2 py-1 mt-1 rounded-md text-sm font-medium ${getStatusColor(
                          grievance.status
                        )}`}
                      >
                        {grievance.status}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">Category:</p>
                      <p>{grievance.category}</p>
                    </div>
                    {grievance.resolved_at && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">Resolved on:</p>
                        <p>{new Date(grievance.resolved_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {grievance.remark && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-6">
                      <p className="font-medium mb-1 text-red-800">Rejection Reason:</p>
                      <p className="text-red-700">{grievance.remark}</p>
                    </div>
                  )}

                  {/* Direction Button - Hidden for Rejected status */}
                  {grievance.status !== "Rejected" && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => router.push(getRedirectUrl(grievance.category))}
                        className="px-6 py-2 bg-maroon-700 text-white rounded-lg hover:bg-maroon-800 transition-all transform hover:scale-105 shadow-md font-medium"
                        style={{ backgroundColor: colors.primary }}
                      >
                        View in {grievance.category} Complaints
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Placeholder */}
        {!grievances.length && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <p className="text-xl">Enter a Student ID to track complaint status</p>
          </div>
        )}
      </div>
    </div>
  );
}