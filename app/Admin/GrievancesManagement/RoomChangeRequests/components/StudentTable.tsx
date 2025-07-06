'use client';

import { StudentResult } from '../types';

interface StudentTableProps {
  results: StudentResult[];
  selectedStudents: StudentResult[];
  onSelectStudent: (student: StudentResult) => void;
  onChangeRoom: (student: StudentResult) => void;
}

const StudentTable = ({ results, selectedStudents, onSelectStudent, onChangeRoom }: StudentTableProps) => {
  if (results.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Select</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">CET ID</th>
            <th className="p-2 text-left">Course</th>
            <th className="p-2 text-left">Gender</th>
            <th className="p-2 text-left">Mobile</th>
            <th className="p-2 text-left">Room</th>
            <th className="p-2 text-left">Building</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {results.map((student) => (
            <tr key={student.id} className="border-t">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selectedStudents.some((s) => s.id === student.id)}
                  onChange={() => onSelectStudent(student)}
                />
              </td>
              <td className="p-2">{student.name}</td>
              <td className="p-2">{student.cet_application_id}</td>
              <td className="p-2">{student.course}</td>
              <td className="p-2">{student.gender}</td>
              <td className="p-2">{student.mobile_number}</td>
              <td className="p-2">{student.room_number || '-'}</td>
              <td className="p-2">{student.building_name || '-'}</td>
              <td className="p-2">
                <button
                  onClick={() => onChangeRoom(student)}
                  className="px-2 py-1 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701]"
                >
                  Change Room
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { StudentTable };