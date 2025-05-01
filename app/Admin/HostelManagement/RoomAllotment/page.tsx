// app/Admin/HostelManagement/RoomAllotment/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Header from '@/app/Components/Header';
import Footer from '@/app/Components/Footer';
import StudentList from './Components/StudentList';
import AllocatedStudents from './Components/AllocatedStudents';
import HostelAvailability from './Components/HostelAvailability';
import Notification from './Components/Notification';
import { NotificationProvider } from './Contexts/NotificationContext';
import { supabase } from '@/supabase/supabaseClient';
import { HostelApplication, Room, Degree, ApplicationStatus, Gender } from './Types/Type';

export default function RoomAllotmentPage() {
  const [applications, setApplications] = useState<HostelApplication[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeTab, setActiveTab] = useState<Degree>('BTech');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const degrees: Degree[] = ['BTech', 'MTech', 'MCA', 'Diploma'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch hostel applications where hostel_fees_status is 'Paid'
        const { data: appData, error: appError } = await supabase
          .from('hostel_applications')
          .select('id, cet_application_id, course, gender, hostel_allotment_status, building_name, room_number')
          .eq('hostel_fees_status', 'Paid');

        if (appError) {
          console.error('Detailed error fetching applications:', appError);
          throw new Error(`Failed to fetch applications: ${appError.message || 'Unknown error'}`);
        }

        console.log('Raw fetched applications (hostel_fees_status = Paid):', appData);

        // Fetch profiles to get names
        const appIds = appData?.map((app) => app.id) || [];
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', appIds);

        if (profileError) {
          console.error('Detailed error fetching profiles:', profileError);
          throw new Error(`Failed to fetch profiles: ${profileError.message || 'Unknown error'}`);
        }

        // Map applications with profile names and normalize status
        const mappedApplications: HostelApplication[] = (appData || []).map((app) => {
          const profile = profileData?.find((p) => p.id === app.id);
          const rawStatus = app.hostel_allotment_status?.toLowerCase();
          const normalizedStatus: ApplicationStatus =
            rawStatus === 'pending'
              ? 'Pending'
              : rawStatus === 'accepted'
              ? 'Accepted'
              : rawStatus === 'rejected'
              ? 'Rejected'
              : 'Pending'; // Default to Pending if unknown

          return {
            id: app.id,
            student_id: app.id,
            name: profile?.name || app.cet_application_id || app.id,
            course: app.course,
            gender: app.gender as Gender,
            hostel_allotment_status: normalizedStatus,
            hostel_block: app.building_name,
            room_number: app.room_number,
          };
        });

        console.log('Mapped applications:', mappedApplications);
        setApplications(mappedApplications);

        // Fetch rooms
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*');

        if (roomError) {
          console.error('Detailed error fetching rooms:', roomError);
          throw new Error(`Failed to fetch rooms: ${roomError.message || 'Unknown error'}`);
        }

        setRooms(roomData || []);
      } catch (err: unknown) { // Changed from 'any' to 'unknown'
        // Ensure err is treated as an Error object
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data.';
        console.error('Error in fetchData:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <NotificationProvider>
      <div className="p-6 space-y-6">
        <Header
          rightContent={
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-[#800000]">
                Hostel Room Allocation
              </h1>
              <p className="text-sm text-gray-600">Admin Management Panel</p>
            </div>
          }
        />

        <div className="flex border-b mb-6">
          {degrees.map((degree) => (
            <button
              key={degree}
              className={`px-4 py-2 font-medium ${
                activeTab === degree
                  ? 'border-b-2 text-white bg-red-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab(degree)}
            >
              {degree} Students
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StudentList
            course={activeTab}
            applications={applications}
            setApplications={setApplications}
            setRooms={setRooms}
            rooms={rooms}
          />
          <AllocatedStudents course={activeTab} applications={applications} />
        </div>

        <HostelAvailability rooms={rooms} />

        <Notification />

        <Footer />
      </div>
    </NotificationProvider>
  );
}