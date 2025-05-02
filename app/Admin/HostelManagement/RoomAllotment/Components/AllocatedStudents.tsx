// app/Admin/HostelManagement/RoomAllotment/Components/AllocatedStudents.tsx
import { HostelApplication } from '../Types/Type';
import { formatCourseDisplay, mapFromDbCourse } from '../utils/courseUtils';

interface AllocatedStudentsProps {
  course: string; // Matches degree name (e.g., 'Bachelor of Technology (B.Tech)')
  applications: HostelApplication[];
}

export default function AllocatedStudents({ course, applications }: AllocatedStudentsProps) {
  // Filter applications where degree matches course and status is Accepted
  const allocatedApplications = applications.filter(
    (app) =>
      mapFromDbCourse(app.course).degree === course &&
      app.hostel_allotment_status === 'Accepted' &&
      app.hostel_block &&
      app.room_number
  );

  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-[#800000] mb-4">
        {course
          .replace('Bachelor of Technology (B.Tech)', 'B.Tech')
          .replace('Master of Technology (M.Tech)', 'M.Tech')
          .replace('Master of Computer Application (MCA)', 'MCA')} Students Room Allocation
      </h2>
      <div className="border rounded-md mb-4 max-h-64 overflow-y-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Course</th>
              <th className="p-2 text-left">Gender</th>
              <th className="p-2 text-left">Room</th>
            </tr>
          </thead>
          <tbody>
            {allocatedApplications.map((app) => (
              <tr key={app.id} className="border-t">
                <td className="p-2">{app.name}</td>
                <td className="p-2">{formatCourseDisplay(app.course)}</td>
                <td className="p-2">{app.gender}</td>
                <td className="p-2">
                  <span className="bg-red-100 text-red-800 py-1 px-2 rounded">
                    {app.hostel_block}, Room {app.room_number}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}