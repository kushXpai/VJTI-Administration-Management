"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/supabase/supabaseClient";

export default function HostelComplaintsAdmin() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");

  const fetchGrievances = async () => {
    const { data } = await supabase
      .from("grievances")
      .select("*")
      .eq("category", "Mess")
      .order("created_at", { ascending: false });
    setGrievances(data || []);
  };

  const updateStatus = async (id: string, newStatus: string, remark?: string) => {
    setLoading(true);

    const updates: any = {
      status: newStatus,
      resolved_at: newStatus === "Resolved" ? new Date().toISOString() : null,
    };

    if (newStatus === "Rejected" && remark) {
      updates.remark = remark; // Save remark separately
    } else if (newStatus !== "Rejected") {
      updates.remark = null; // Clear remark if status changed again
    }

    await supabase
      .from("grievances")
      .update(updates)
      .eq("id", id);

    await fetchGrievances();
    setSelectedComplaint(null);
    setShowRejectBox(false);
    setRejectRemark("");
    setLoading(false);
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

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
  };

  const filteredGrievances = selectedStatus === "All"
    ? grievances
    : grievances.filter(g => g.status === selectedStatus);

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 bg-gray-100">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6" style={{ color: colors.primary }}>
          Manage Mess Grievances
        </h1>

        {/* Dropdown Filter */}
        <div className="flex justify-end mb-6">
          <select
            className="border p-2 rounded-lg"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Complaints List */}
        {filteredGrievances.length === 0 ? (
          <p className="text-center text-gray-600">No complaints available.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredGrievances.map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedComplaint(g)}
                className="p-4 border rounded-lg bg-gray-50 shadow-md cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg" style={{ color: colors.textPrimary }}>
                    {g.issue_text.slice(0, 60)}...
                  </p>
                  <span
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor:
                        g.status === "Resolved" ? "#A5D6A7" :
                        g.status === "Pending" ? "#FFE082" :
                        g.status === "In Progress" ? "#81D4FA" :
                        "#EF9A9A",
                      color: colors.textPrimary,
                    }}
                  >
                    {g.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Complaint Details */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>
              Complaint Details
            </h2>

            <p className="mb-2">
              <span className="font-semibold">Issue:</span> {selectedComplaint.issue_text}
            </p>

            {selectedComplaint.image_url && (
              <img
                src={selectedComplaint.image_url}
                alt="proof"
                className="mt-4 rounded-lg max-h-80 object-cover"
              />
            )}

            <p className="mt-4 text-sm" style={{ color: colors.textSecondary }}>
              Uploaded by Student ID: <span className="font-semibold">{selectedComplaint.student_id}</span>
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Submitted on: <span className="font-semibold">{new Date(selectedComplaint.created_at).toLocaleString()}</span>
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Status: <span className="font-bold">{selectedComplaint.status}</span>
            </p>

            {/* If rejected, show remark */}
            {selectedComplaint.status === "Rejected" && selectedComplaint.remark && (
              <div className="mt-4">
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  <span className="font-semibold">Rejection Reason:</span> {selectedComplaint.remark}
                </p>
              </div>
            )}

            {/* Admin Actions */}
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={() => updateStatus(selectedComplaint.id, "Resolved")}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all"
                disabled={loading}
              >
                Mark as Resolved
              </button>
              <button
                onClick={() => updateStatus(selectedComplaint.id, "Pending")}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all"
                disabled={loading}
              >
                Mark as Pending
              </button>
              <button
                onClick={() => updateStatus(selectedComplaint.id, "In Progress")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
                disabled={loading}
              >
                Mark as In Progress
              </button>
              <button
                onClick={() => setShowRejectBox(true)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all"
                disabled={loading}
              >
                Mark as Rejected
              </button>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="ml-auto px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-all"
              >
                Close
              </button>
            </div>

            {/* Reject Remark Box */}
            {showRejectBox && (
              <div className="mt-6">
                <textarea
                  className="w-full border p-2 rounded-lg"
                  rows={3}
                  placeholder="Enter rejection reason..."
                  value={rejectRemark}
                  onChange={(e) => setRejectRemark(e.target.value)}
                ></textarea>

                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    onClick={() => {
                      if (rejectRemark.trim() === "") {
                        alert("Please enter a valid reason to reject.");
                        return;
                      }
                      updateStatus(selectedComplaint.id, "Rejected", rejectRemark);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
                  >
                    Confirm Reject
                  </button>
                  <button
                    onClick={() => setShowRejectBox(false)}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
