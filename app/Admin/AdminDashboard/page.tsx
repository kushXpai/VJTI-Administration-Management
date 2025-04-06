// app/Admin/AdminDashboard/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminDashboard() {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    router.push('/');
  };

  const sections = [
    {
      title: 'Hostel Management',
      items: [
        { name: 'Review Applications', path: '/Admin/HostelManagement/ReviewApplications' },
        { name: 'Generate Merit List', path: '/Admin/HostelManagement/GenerateMeritList' },
        { name: 'Room Allotment', path: '/Admin/HostelManagement/RoomAllotment' },
        { name: 'Review Allotment', path: '/Admin/HostelManagement/ReviewAllotment' },
        { name: 'Vacancy', path: '/Admin/HostelManagement/Vacancy' },
        { name: 'Seat Matrix', path: '/Admin/HostelManagement/SeatMatrix' },
        { name: 'Hostel ID Card', path: '/Admin/HostelManagement/HostelID' },
      ],
    },
    {
      title: 'Grievances',
      items: [
        { name: 'Hostel Complaints', path: '/Admin/Grievances/HostelComplaints' },
        { name: 'Mess Complaints', path: '/Admin/Grievances/MessComplaints' },
        { name: 'General Complaints', path: '/Admin/Grievances/GeneralComplaints' },
        { name: 'Track Complaint Status', path: '/Admin/Grievances/TrackComplaintStatus' },
        { name: 'Room Change Requests', path: '/Admin/Grievances/RoomChangeRequests' },
        { name: 'Feedbacks', path: '/Admin/Grievances/Feedbacks' },
      ],
    },
    {
      title: 'Mess Management',
      items: [
        { name: 'Update Mess Menu', path: '/Admin/Mess/UpdateMenu' },
        { name: 'Manage Payments', path: '/Admin/Mess/ManagePayments' },
        { name: 'Track Inventory', path: '/Admin/Mess/TrackInventory' },
        { name: 'Feedbacks', path: '/Admin/Mess/Feedbacks' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-300 bg-white shadow">
        <div className="flex items-center gap-4">
          <Image src="/images/vjti_logo.svg" alt="VJTI Logo" width={50} height={50} />
          <div>
            <h1 className="text-xl font-bold text-[#800000]">Veermata Jijabai Technological Institute</h1>
            <p className="text-sm text-gray-600">Matunga East, Mumbai, Maharashtra 400019</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Welcome, Admin</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Section Rendering */}
      {sections.map((section, index) => (
        <section className="p-6" key={index}>
          <h2 className="text-2xl font-semibold mb-4 text-[#800000]">{section.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => navigateTo(item.path)}
                className="bg-red-700 hover:bg-red-800 text-white font-medium rounded p-4 shadow-md transition-all duration-200"
              >
                {item.name}
              </button>
            ))}
          </div>
        </section>
      ))}

      {/* Footer */}
      <footer className="mt-auto p-4 text-center text-gray-600 border-t border-gray-200">
        &copy; 2024 Veermata Jijabai Technological Institute. All rights reserved.
      </footer>
    </div>
  );
}