// app/Admin/HostelManagement/ReviewApplications/Utilities/Components/ApplicationCard.tsx

import React, { useState } from 'react';
import Image from 'next/image';

interface Application {
  id: string;
  hostel_application_status: 'Accepted' | 'Pending' | 'Rejected';
  cet_application_id: string;
  cet_rank: string | number;
  present_address_line1?: string;
  present_address_line2?: string;
  present_city: string;
  present_state: string;
  aadhar_card_number: string;
  photo_url: string;
  aadhar_card_url: string;
  acknowledgement_receipt_url: string;
  fee_receipt_url: string;
}

interface ApplicationCardProps {
  application: Application;
  studentName: string;
  updateStatus: (id: string, status: 'Accepted' | 'Pending' | 'Rejected') => Promise<void>;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ 
  application, 
  studentName,
  updateStatus
}) => {
  const [status, setStatus] = useState<'Accepted' | 'Pending' | 'Rejected'>(
    application.hostel_application_status as 'Accepted' | 'Pending' | 'Rejected'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as 'Accepted' | 'Pending' | 'Rejected');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await updateStatus(application.id, status);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="bg-[#800000] text-white py-3 px-4">
        <h3 className="font-semibold text-lg">{studentName}</h3>
      </div>
      
      <div className="p-4">
        {application.photo_url && (
          <div className="mb-4 flex justify-center">
            <div className="relative w-24 h-24 overflow-hidden rounded-full border-2 border-gray-300">
              <Image 
                src={application.photo_url} 
                alt={`${studentName}'s photo`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
        
        <div className="space-y-2 mb-4">
          <InfoRow label="CET Application ID" value={application.cet_application_id} />
          <InfoRow label="CET Rank" value={application.cet_rank} />
          <InfoRow label="Address" value={`${application.present_address_line1 || ''} ${application.present_address_line2 || ''}`} />
          <InfoRow label="City" value={application.present_city} />
          <InfoRow label="State" value={application.present_state} />
          <InfoRow label="Aadhar Number" value={application.aadhar_card_number} />
        </div>

        <div className="space-y-2 mb-4">
          <DocumentLink label="Aadhar Card" url={application.aadhar_card_url} />
          <DocumentLink label="Acknowledgement Receipt" url={application.acknowledgement_receipt_url} />
          <DocumentLink label="Fee Receipt" url={application.fee_receipt_url} />
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Application Status:
            </label>
            <select
              value={status}
              onChange={handleStatusChange}
              className="mt-1 block w-32 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm"
            >
              <option value="Accepted">Accepted</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-4 w-full bg-[#800000] text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string | number | null }> = ({ label, value }) => {
  if (!value) return null;
  
  return (
    <div className="flex justify-between">
      <span className="text-sm font-medium text-gray-500">{label}:</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
};

const DocumentLink: React.FC<{ label: string; url: string | null }> = ({ label, url }) => {
  if (!url) return null;
  
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-gray-500">{label}:</span>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-sm text-red-600 hover:text-red-800 hover:underline"
      >
        View Document
      </a>
    </div>
  );
};

export default ApplicationCard;