// app/Admin/HostelManagement/RoomAllotment/Components/StudentList.tsx
"use client";

import { useState, useMemo } from 'react';
import ManualAllocationModal from './ManualAllocationModal';
import { HostelApplication, Room, Degree } from '../Types/Type';
import { useNotification } from '../Contexts/NotificationContext';
import { supabase } from '@/supabase/supabaseClient';
import { formatCourseDisplay, mapFromDbCourse } from '../utils/courseUtils';

interface StudentListProps {
  course: Degree; // Matches degree name (e.g., 'Bachelor of Technology (B.Tech)')
  applications: HostelApplication[];
  setApplications: React.Dispatch<React.SetStateAction<HostelApplication[]>>;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  rooms: Room[];
}

export default function StudentList({
  course,
  applications,
  setApplications,
  setRooms,
  rooms,
}: StudentListProps) {
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const filteredApplications = applications.filter((app) => {
    const { degree } = mapFromDbCourse(app.course);
    return degree === course;
  });

  const pendingApplications = filteredApplications.filter(
    (app) => app.hostel_allotment_status === 'Pending'
  );

  const selectedApp = useMemo(
    () => applications.find((app) => app.id === selectedApplication) || null,
    [applications, selectedApplication]
  );

  const handleAllocate = (applicationId: string) => {
    setSelectedApplication(applicationId);
  };

  const handleAutoAllocate = async () => {
    const boysRooms: Room[] = rooms.filter((room) => room.type === 'Boys' && room.vacant > 0);
    const girlsRooms: Room[] = rooms.filter((room) => room.type === 'Girls' && room.vacant > 0);

    let updatedRooms = [...rooms];
    let updatedApplications = [...applications];

    for (const app of pendingApplications) {
      const roomType = app.gender === 'Male' ? 'Boys' : 'Girls';
      const availableRooms = roomType === 'Boys' ? boysRooms : girlsRooms;

      if (availableRooms.length === 0) {
        showNotification(`No available ${roomType} rooms for ${app.name}.`, 'error');
        continue;
      }

      const room = availableRooms[0];
      const updatedOccupantsList = [...room.occupants_list, String(app.id)];

      const { error: roomError } = await supabase
        .from('rooms')
        .update({
          vacant: room.vacant - 1,
          occupants: room.occupants + 1,
          occupants_list: updatedOccupantsList,
        })
        .eq('id', room.id);

      if (roomError) {
        showNotification(`Error updating room for ${app.name}: ${roomError.message}`, 'error');
        continue;
      }

      const { error: appError } = await supabase
        .from('hostel_applications')
        .update({
          hostel_allotment_status: 'Accepted',
          building_name: room.building_name,
          room_number: room.room_number,
        })
        .eq('id', app.id);

      if (appError) {
        showNotification(`Error updating application for ${app.name}: ${appError.message}`, 'error');
        continue;
      }

      updatedApplications = updatedApplications.map((a) =>
        a.id === app.id
          ? {
              ...a,
              hostel_allotment_status: 'Accepted',
              hostel_block: room.building_name,
              room_number: room.room_number,
            }
          : a
      );

      updatedRooms = updatedRooms.map((r) =>
        r.id === room.id
          ? {
              ...r,
              vacant: r.vacant - 1,
              occupants: r.occupants + 1,
              occupants_list: updatedOccupantsList,
            }
          : r
      );

      if (roomType === 'Boys') {
        boysRooms[0].vacant -= 1;
        boysRooms[0].occupants += 1;
        boysRooms[0].occupants_list = updatedOccupantsList;
        if (boysRooms[0].vacant === 0) boysRooms.shift();
      } else {
        girlsRooms[0].vacant -= 1;
        girlsRooms[0].occupants += 1;
        girlsRooms[0].occupants_list = updatedOccupantsList;
        if (girlsRooms[0].vacant === 0) girlsRooms.shift();
      }

      showNotification(
        `Allocated ${app.name} to ${room.building_name}, Room ${room.room_number}`,
        'success'
      );
    }

    setApplications(updatedApplications);
    setRooms(updatedRooms);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Pending Applications</h2>
        {pendingApplications.length > 0 && (
          <button
            className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
            onClick={handleAutoAllocate}
          >
            Auto Allocate
          </button>
        )}
      </div>

      {pendingApplications.length === 0 ? (
        <p className="text-gray-600">No pending applications for {course} students.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left text-gray-600">Name</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Gender</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Course</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-gray-800">{app.name}</td>
                  <td className="py-2 px-4 border-b text-gray-800">{app.gender}</td>
                  <td className="py-2 px-4 border-b text-gray-800">{formatCourseDisplay(app.course)}</td>
                  <td className="py-2 px-4 border-b text-gray-800">{app.hostel_allotment_status}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      className="bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800"
                      onClick={() => handleAllocate(app.id)}
                    >
                      Allocate Manually
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ManualAllocationModal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        application={selectedApp}
        rooms={rooms}
        setApplications={setApplications}
        setRooms={setRooms}
      />
    </div>
  );
}