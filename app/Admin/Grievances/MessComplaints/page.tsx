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
  const [selectedStatusForUpdate, setSelectedStatusForUpdate] = useState<string>("");
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

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
      updates.remark = remark;
    } else if (newStatus !== "Rejected") {
      updates.remark = null;
    }

    await supabase.from("grievances").update(updates).eq("id", id);

    await fetchGrievances();
    setSelectedComplaint(null);
    setShowRejectBox(false);
    setRejectRemark("");
    setLoading(false);
  };

  const markAsOpened = async (id: string) => {
    await supabase.from("grievances").update({ is_opened: true }).eq("id", id);
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
    lightBlue: '#81D4FA',
    lightGreen: '#A5D6A7',
    lightRed: '#EF9A9A',
    lightYellow: '#FFF59D',
  };

  const filteredGrievances = selectedStatus === "All"
    ? grievances
    : grievances.filter((g) => g.status === selectedStatus);

  const handleStatusChange = (status: string) => {
    if (status === "Rejected") {
      setDialogMessage("Are you sure you want to reject this complaint?");
      setShowConfirmationDialog(true);
      setSelectedStatusForUpdate("Rejected");
    } else {
      setDialogMessage(`Are you sure you want to change status to ${status}?`);
      setShowConfirmationDialog(true);
      setSelectedStatusForUpdate(status);
    }
  };

  const handleConfirmDialog = async (action: "Yes" | "No") => {
    if (action === "Yes") {
      setShowConfirmationDialog(false);
      if (selectedStatusForUpdate === "Rejected") {
        setShowRejectBox(true);
      } else {
        await updateStatus(selectedComplaint.id, selectedStatusForUpdate);
        alert(`Complaint status changed to "${selectedStatusForUpdate}".`);
      }
    } else {
      setShowConfirmationDialog(false);
    }
  };

  const handleRejectedStatus = () => {
    setDialogMessage("Are you sure you want to reject this complaint?");
    setShowConfirmationDialog(true);
    setSelectedStatusForUpdate("Rejected");
  };

  const handleSubmitRejection = async () => {
    if (!rejectRemark) {
      alert("Please provide a rejection reason.");
      return;
    }
    await updateStatus(selectedComplaint.id, "Rejected", rejectRemark);
    alert("Complaint rejected successfully.");
  };

  const renderStatusButtons = () => {
    let statusOptions: string[] = [];

    if (selectedComplaint.status === "Pending") {
      statusOptions = ["In Progress", "Resolved", "Rejected"];
    } else if (selectedComplaint.status === "In Progress") {
      statusOptions = ["Pending", "Resolved", "Rejected"];
    } else if (selectedComplaint.status === "Resolved") {
      statusOptions = ["Pending", "In Progress", "Rejected"];
    } else if (selectedComplaint.status === "Rejected") {
      statusOptions = ["Pending", "In Progress", "Resolved"];
    }

    return statusOptions.map((status) => (
      <button
        key={status}
        onClick={() => {
          if (status === "Rejected") {
            handleRejectedStatus();
          } else {
            handleStatusChange(status);
          }
        }}
        className={`px-4 py-2 ${
          status === "In Progress" ? "bg-blue-400" :
          status === "Resolved" ? "bg-green-600" :
          status === "Pending" ? "bg-yellow-400" :
          "bg-red-600"
        } text-white rounded hover:bg-opacity-80 transition-all transform hover:scale-105`}
      >
        {status}
      </button>
    ));
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 bg-gray-100">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6" style={{ color: colors.primary }}>
          Manage General Grievances
        </h1>

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

        {filteredGrievances.length === 0 ? (
          <p className="text-center text-gray-600">No complaints available.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredGrievances.map((g) => (
              <div
                key={g.id}
                onClick={() => {
                  if (!g.is_opened) {
                    markAsOpened(g.id);
                  }
                  setSelectedComplaint(g);
                }}
                className={`p-4 border rounded-lg bg-gray-50 shadow-md cursor-pointer hover:shadow-lg transition-all ${!g.is_opened ? 'border-yellow-500' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg" style={{ color: colors.textPrimary }}>
                    {g.issue_text.slice(0, 60)}...
                  </p>
                  <span
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor:
                        g.status === "Resolved" ? colors.lightGreen :
                        g.status === "Pending" ? colors.lightYellow :
                        g.status === "In Progress" ? colors.lightBlue :
                        colors.lightRed,
                      color: colors.textPrimary,
                    }}
                  >
                    {g.status}
                  </span>
                </div>
                {!g.is_opened && (
                  <span className="inline-block bg-red-500 text-white text-xs font-semibold py-1 px-2 rounded-full mt-2">
                    New
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full shadow-2xl relative border-1">
            <button
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white text-2xl font-bold flex items-center justify-center rounded-md transform transition-all hover:bg-red-600 hover:scale-105 active:scale-95"
            >
              X
            </button>

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
                className="mt-4 rounded-lg max-h-80 object-cover shadow-md"
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

            
              <div className="mt-6">
                <h3 className="text-lg font-bold">Update Complaint Status</h3>
                <div className="flex gap-4 mt-4">
                  {renderStatusButtons()}
                </div>
              </div>
            
          </div>
        </div>
      )}

      {showConfirmationDialog && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">{dialogMessage}</h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleConfirmDialog("Yes")}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all"
              >
                Yes
              </button>
              <button
                onClick={() => handleConfirmDialog("No")}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectBox && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4" style={{ color: colors.primary }}>
              Enter Rejection Reason
            </h3>
            <textarea
              className="w-full border p-2 rounded-lg"
              rows={4}
              placeholder="Enter reason..."
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
            ></textarea>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSubmitRejection}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
              >
                Submit
              </button>
              <button
                onClick={() => setShowRejectBox(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
