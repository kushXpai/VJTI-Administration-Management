// app/Admin/GrievancesManagement/MessComplaints

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/supabase/supabaseClient";
import Image from 'next/image';

// Define a type for the grievance object
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

export default function MessComplaints() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState<Grievance | null>(null);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [selectedStatusForUpdate, setSelectedStatusForUpdate] = useState<string>("");
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      // Make sure we're using the correct table and query
      console.log("Fetching grievances...");
      
      const { data, error } = await supabase
        .from("grievances")
        .select("*")
        .eq("category", "Mess")
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Supabase error fetching grievances:", error);
        throw error;
      }
      
      console.log("Grievances fetched successfully:", data);
      setGrievances(data || []);
    } catch (error) {
      console.error("Error fetching grievances:", error);
      alert("Failed to fetch grievances. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string, remark?: string) => {
    setLoading(true);
    try {
      console.log("Updating status for grievance:", id);
      console.log("New status:", newStatus);
      console.log("Remark:", remark);
      
      const updates: {
        status: string;
        resolved_at: string | null;
        remark?: string | null;
      } = {
        status: newStatus,
        resolved_at: newStatus === "Resolved" ? new Date().toISOString() : null,
      };

      if (newStatus === "Rejected" && remark) {
        updates.remark = remark;
      } else if (newStatus !== "Rejected") {
        updates.remark = null;
      }

      // Ensure we're using the correct table name and proper database connection
      const { error } = await supabase
        .from("grievances")
        .update(updates)
        .eq("id", id);
      
      if (error) {
        console.error("Supabase error updating status:", error);
        throw error;
      }
      
      // Verify the update by fetching the updated record
      const { data: updatedData, error: fetchError } = await supabase
        .from("grievances")
        .select("*")
        .eq("id", id)
        .single();
        
      if (fetchError) {
        console.error("Error fetching updated grievance:", fetchError);
      } else {
        console.log("Status updated successfully, verified data:", updatedData);
      }
      
      // Refresh the entire grievances list
      await fetchGrievances();
      
      // If we're viewing the updated complaint, update the selected complaint as well
      if (selectedComplaint && selectedComplaint.id === id) {
        // Get the fresh data from the updated grievances list
        const updatedGrievance = grievances.find(g => g.id === id);
        if (updatedGrievance) {
          setSelectedComplaint(updatedGrievance);
        }
      }

      // Clear UI states
      setShowRejectBox(false);
      setRejectRemark("");
      
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const markAsOpened = async (id: string) => {
    try {
      console.log("Marking grievance as opened:", id);
      
      // Update in the database
        
      const { error } = await supabase
        .from('grievances')
        .update({ is_opened: true })
        .eq('id', id);

      if (error) {
        console.error("Supabase error updating is_opened:", error);
        throw error;
      }
      
      console.log("Successfully marked as opened in database");
      
      // Update the local state immediately
      setGrievances(prevGrievances => 
        prevGrievances.map(g => 
          g.id === id ? { ...g, is_opened: true } : g
        )
      );
      
    } catch (error) {
      console.error("Error marking as opened:", error);
      alert("Failed to mark complaint as read. Please try again.");
    }
  };

  useEffect(() => {
    // Check if Supabase client is properly initialized
    if (!supabase) {
      console.error("Supabase client is not initialized");
      return;
    }
    
    // Fetch initial data
    fetchGrievances();
    
    // Setup real-time subscription to grievances table
    const subscription = supabase
      .channel('grievances-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'grievances',
          filter: `category=eq.Mess`
        }, 
        (payload) => {
          console.log('Change received!', payload);
          // Refresh data when there's a change
          fetchGrievances();
        }
      )
      .subscribe();
      
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
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
        if (selectedComplaint) {
          try {
            await updateStatus(selectedComplaint.id, selectedStatusForUpdate);
            
            // Verify the update was successful
            const { data, error } = await supabase
              .from("grievances")
              .select("*")
              .eq("id", selectedComplaint.id)
              .single();
              
            if (error) {
              console.error("Error verifying status update:", error);
              alert("There might have been an issue with the update. Please check the status.");
            } else if (data.status !== selectedStatusForUpdate) {
              console.error("Database status not updated correctly", data);
              alert("The database update may have failed. Please try again.");
            } else {
              console.log("Status update successful and verified:", data);
              alert(`Complaint status changed to "${selectedStatusForUpdate}".`);
            }
          } catch (error) {
            console.error("Error in status update process:", error);
            alert("Failed to update status. Please try again.");
          }
        }
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
    if (selectedComplaint) {
      try {
        await updateStatus(selectedComplaint.id, "Rejected", rejectRemark);
        
        // Double-check if the update was successful
        const { data, error } = await supabase
          .from("grievances")
          .select("*")
          .eq("id", selectedComplaint.id)
          .single();
          
        if (error) {
          console.error("Error verifying rejection update:", error);
          alert("There might have been an issue with the update. Please check the status.");
        } else if (data.status !== "Rejected") {
          console.error("Database status not updated to Rejected", data);
          alert("The database update may have failed. Please try again.");
        } else {
          console.log("Rejection successful and verified:", data);
          alert("Complaint rejected successfully.");
        }
      } catch (error) {
        console.error("Error in rejection process:", error);
        alert("Failed to reject complaint. Please try again.");
      }
    }
  };

  const renderStatusButtons = () => {
    if (!selectedComplaint) return null;
    
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
          status === "In Progress" ? "bg-blue-500" :
          status === "Resolved" ? "bg-green-500" :
          status === "Pending" ? "bg-yellow-500" :
          "bg-red-500"
        } text-white rounded-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-md font-medium`}
      >
        {status}
      </button>
    ));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Resolved": return "bg-green-100 text-green-800 border-green-300";
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-300";
      case "Rejected": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleComplaintClick = async (grievance: Grievance) => {
    // First mark as opened
    if (!grievance.is_opened) {
      await markAsOpened(grievance.id);
    }
    
    // Then set as selected complaint
    setSelectedComplaint(grievance);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-8" style={{ color: colors.primary }}>
          Manage Mess Grievances
        </h1>

        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            {loading ? "Loading..." : `${filteredGrievances.length} complaint(s) found`}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by status:</span>
            <select
              className="border p-2 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500"
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
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-700"></div>
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M9 16h6M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707M16.95 7.05l.707-.707M7.05 16.95l.707-.707" />
            </svg>
            <p className="text-xl">No complaints available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredGrievances.map((g) => (
              <div
                key={g.id}
                onClick={() => handleComplaintClick(g)}
                className={`p-5 border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer
                  ${!g.is_opened ? 'bg-white border-l-4 border-l-yellow-500' : 'bg-white'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-lg truncate max-w-lg">
                        {g.issue_text.length > 60 ? `${g.issue_text.slice(0, 60)}...` : g.issue_text}
                      </p>
                      {!g.is_opened && (
                        <span className="inline-block bg-red-500 text-white text-xs font-semibold py-1 px-2 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Student ID: {g.student_id} • Submitted: {new Date(g.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(g.status)}`}
                  >
                    {g.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-2xl w-full shadow-2xl relative border">
            <button
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white flex items-center justify-center rounded-full transform transition-all hover:bg-red-600 hover:scale-105 active:scale-95"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>
              Complaint Details
            </h2>

            <div className="p-4 bg-gray-50 rounded-lg border mb-4">
              <p className="font-medium mb-2">Issue:</p>
              <p className="text-gray-700">{selectedComplaint.issue_text}</p>
            </div>

            {selectedComplaint.image_url && (
              <div className="mb-6">
                <p className="font-medium mb-2">Attached Image:</p>
                <Image src={selectedComplaint.image_url} alt="description" width={500} height={300} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Student ID:</p>
                <p>{selectedComplaint.student_id}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Submitted on:</p>
                <p>{new Date(selectedComplaint.created_at).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Current Status:</p>
                <span className={`inline-block px-2 py-1 mt-1 rounded-md text-sm font-medium ${getStatusColor(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </span>
              </div>
              {selectedComplaint.resolved_at && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">Resolved on:</p>
                  <p>{new Date(selectedComplaint.resolved_at).toLocaleString()}</p>
                </div>
              )}
            </div>

            {selectedComplaint.remark && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-6">
                <p className="font-medium mb-1 text-red-800">Rejection Reason:</p>
                <p className="text-red-700">{selectedComplaint.remark}</p>
              </div>
            )}
            
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-bold mb-4">Update Complaint Status</h3>
              <div className="flex flex-wrap gap-3">
                {renderStatusButtons()}
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmationDialog && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{dialogMessage}</h3>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => handleConfirmDialog("No")}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDialog("Yes")}
                className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectBox && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>
              Enter Rejection Reason
            </h3>
            <textarea
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={4}
              placeholder="Please provide a detailed reason for rejection..."
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
            ></textarea>
            <div className="flex gap-4 mt-6 justify-end">
              <button
                onClick={() => setShowRejectBox(false)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRejection}
                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}