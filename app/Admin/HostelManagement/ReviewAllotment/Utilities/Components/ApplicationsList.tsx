// app/Admin/HostelManagement/ReviewApplications/Utilities/Components/ApplicationsList.tsx

import React from 'react';
import ApplicationCard from './ApplicationCard';
import type { Application } from '../Types/Application';

interface ApplicationsListProps {
  applications: Application[];
  getStudentName: (id: string) => string;
  updateStatus: (id: string, status: 'Pending' | 'Paid') => Promise<void>;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({ 
  applications, 
  getStudentName,
  updateStatus
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {applications.map(application => (
        <ApplicationCard
          key={application.id}
          application={application}
          studentName={getStudentName(application.id)}
          updateStatus={updateStatus}
        />
      ))}
    </div>
  );
};

export default ApplicationsList;