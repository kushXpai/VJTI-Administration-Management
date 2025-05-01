// app/Admin/HostelManagement/RoomAllotment/Components/StudentList.tsx
"use client";

import { useState } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { HostelApplication, Degree, HostelBlock, Room } from '../Types/Type';
import ManualAllocationModal from './ManualAllocationModal';
import { formatCourseDisplay } from '../utils/courseUtils';
import { useNotification } from '../Contexts/NotificationContext'; 

interface StudentListProps {
  course: Degree;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showNotification } = useNotification(); 

  // Map gender to room type
  const genderToRoomType = (gender: string): string => {
    return gender === 'Male' ? 'Boys' : 'Girls';
  };

  // Define allowed buildings for each room type
  const allowedBuildings: Record<string, HostelBlock[]> = {
    Boys: ['PG Block', 'C Block', 'D Block'],
    Girls: ['B Block'],
  };

  const allocateRoomsByCourse = async () => {
    const appsToAllocate = applications.filter(
      (app) => app.course.startsWith(course) && app.hostel_allotment_status !== 'Accepted'
    );

    console.log(`Applications for ${course}:`, applications.filter((app) => app.course.startsWith(course)));
    console.log(`Apps to allocate for ${course}:`, appsToAllocate);

    if (appsToAllocate.length === 0) {
      showNotification(`No students available to allocate for ${course}.`, 'error');
      return;
    }

    let updatedApplications = [...applications];
    let updatedRooms = [...rooms];

    for (const app of appsToAllocate) {
      const roomType = genderToRoomType(app.gender);
      const suitableBuildings = allowedBuildings[roomType];

      // Find available rooms matching type and building
      const suitableRooms = updatedRooms
        .filter(
          (room) =>
            room.type === roomType &&
            suitableBuildings.includes(room.building_name) &&
            room.vacant > 0
        )
        .sort((a, b) => a.vacant - b.vacant);

      if (suitableRooms.length === 0) {
        showNotification(`No available rooms for ${app.name}.`, 'error');
        continue;
      }

      const room = suitableRooms[0];

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
        showNotification(`Error allocating room for ${app.name}: ${roomError.message}`, 'error');
        continue;
      }

      // Update application
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

      // Update local state
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

      // showNotification(
      //   `Allocated ${app.name} to ${room.building_name}, Room ${room.room_number}`,
      //   'success'
      // );
    }

    setApplications(updatedApplications);
    setRooms(updatedRooms);
  };

  const selectedApp = applications.find((app) => app.id === selectedApplication);

  const courseApplications = applications.filter((app) => app.course.startsWith(course));

  const dropdownOptions = applications.filter(
    (app) => app.course.startsWith(course) && app.hostel_allotment_status !== 'Accepted'
  );
  console.log(`Dropdown options for ${course}:`, dropdownOptions);

  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-[#800000] mb-4">
        List of {course} Students
      </h2>
      {courseApplications.length === 0 ? (
        <p className="text-gray-600">
          No students available for {course}. Only students who have paid hostel fees are shown.
        </p>
      ) : (
        <>
          <div className="border rounded-md mb-4 max-h-64 overflow-y-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Course</th>
                  <th className="p-2 text-left">Gender</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {courseApplications.map((app) => (
                  <tr key={app.id} className="border-t">
                    <td className="p-2">{app.name}</td>
                    <td className="p-2">{formatCourseDisplay(app.course)}</td>
                    <td className="p-2">{app.gender}</td>
                    <td className="p-2">
                      {app.hostel_allotment_status === 'Accepted' &&
                      app.hostel_block &&
                      app.room_number ? (
                        <span className="text-green-600 text-sm">Allocated</span>
                      ) : (
                        <span className="text-red-600 text-sm">Not Allocated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex space-x-4">
            <button
              className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
              onClick={allocateRoomsByCourse}
            >
              Auto Allocate
            </button>
            <div className="flex space-x-2">
              <select
                value={selectedApplication || ''}
                onChange={(e) => setSelectedApplication(e.target.value)}
                className="border px-2 py-1 rounded"
              >
                <option value="">Select Student</option>
                {dropdownOptions.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
              <button
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
                onClick={() => setIsModalOpen(true)}
                disabled={!selectedApplication}
              >
                Allocate Manually
              </button>
            </div>
          </div>
        </>
      )}

      <ManualAllocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        application={selectedApp || null}
        rooms={rooms}
        setApplications={setApplications}
        setRooms={setRooms}
      />
    </div>
  );
}