// app/Admin/HostelManagement/RoomAllotment/Components/AllocatedStudents.tsx
import { HostelApplication, Degree } from '../Types/Type';
import { formatCourseDisplay } from '../utils/courseUtils';

interface AllocatedStudentsProps {
  course: Degree;
  applications: HostelApplication[];
}

export default function AllocatedStudents({ course, applications }: AllocatedStudentsProps) {
  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-[#800000] mb-4">
        {course} Students Room Allocation
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
            {applications
              .filter(
                (app) =>
                  app.course.startsWith(course) &&
                  app.hostel_allotment_status === 'Accepted' &&
                  app.hostel_block &&
                  app.room_number &&
                  app.hostel_block !== 'NULL' &&
                  app.room_number !== 'NULL' &&
                  app.hostel_block !== 'null' &&
                  app.room_number !== 'null'
              )
              .map((app) => (
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