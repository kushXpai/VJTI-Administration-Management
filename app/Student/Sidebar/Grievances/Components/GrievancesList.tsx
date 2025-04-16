// app/Student/Sidebar/Grievances/Components/GrievancesList.tsx

'use client';

import { useState } from 'react';

interface Grievance {
  id: string;
  category: string;
  issue_text: string;
  image_url?: string;
  created_at: string;
  resolved_at?: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
}

interface GrievancesListProps {
  grievances: Grievance[];
  isLoading: boolean;
}

export default function GrievancesList({ grievances, isLoading }: GrievancesListProps) {
  const [viewImage, setViewImage] = useState<string | null>(null);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading grievances...</div>;
  }

  if (grievances.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't submitted any grievances yet.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate a complaint ID in format GRV-YYYY-XXX
  const getComplaintId = (grievance: Grievance, index: number) => {
    const year = new Date(grievance.created_at).getFullYear();
    const paddedIndex = String(index + 1).padStart(3, '0');
    return `GRV-${year}-${paddedIndex}`;
  };

  return (
    <>
      <div className="overflow-x-auto w-full">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500">COMPLAINT ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">CATEGORY</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">ISSUE</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">DATE</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">STATUS</th>
              {grievances.some(g => g.image_url) && (
                <th className="text-left py-3 px-4 font-medium text-gray-500">ACTIONS</th>
              )}
            </tr>
          </thead>
          <tbody>
            {grievances.map((grievance, index) => (
              <tr key={grievance.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-4 px-4">{getComplaintId(grievance, index)}</td>
                <td className="py-4 px-4">{grievance.category}</td>
                <td className="py-4 px-4">{grievance.issue_text}</td>
                <td className="py-4 px-4">{formatDate(grievance.created_at)}</td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(grievance.status)}`}>
                    {grievance.status === 'In Progress' ? 'In Progress' : grievance.status}
                  </span>
                </td>
                {grievances.some(g => g.image_url) && (
                  <td className="py-4 px-4">
                    {grievance.image_url && (
                      <button
                        onClick={() => setViewImage(grievance.image_url || null)}
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                        type="button"
                      >
                        View Image
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Modal */}
      {viewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
          onClick={() => setViewImage(null)}
        >
          <div className="relative bg-white p-6 rounded-lg max-w-4xl max-h-4xl w-4/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Grievance Attachment</h3>
              <button 
                className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewImage(null);
                }}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="overflow-auto max-h-96">
              <img 
                src={viewImage}
                alt="Grievance attachment"
                className="max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}