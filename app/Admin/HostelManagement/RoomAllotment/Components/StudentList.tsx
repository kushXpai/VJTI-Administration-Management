import { StudentApplication } from '../Types/Type';
import { filterByCourse } from '../utils/courseUtils';

interface StudentListProps {
  students: StudentApplication[];
  onSelectStudent: (studentId: string) => void;
  loading: boolean;
  selectedCourse: string;
  onCourseSelect: (course: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({
  students,
  onSelectStudent,
  loading,
  selectedCourse,
  onCourseSelect,
}) => {
  // ✅ Filter only those students who are Accepted and Pending
  const pending = students.filter((s) => s.block_allotment_status === 'Pending');
console.log("Pending students count:", pending.length, pending);
const filteredStudents = filterByCourse(pending, selectedCourse);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-[#800000]">Pending Applications</h2>

      <div className="flex space-x-2 mb-4">
        {['All','BTech', 'MTech', 'MCA', 'Diploma'].map((category) => (
          <button
            key={category}
            onClick={() => onCourseSelect(category)}
            className={`px-4 py-2 rounded ${
              selectedCourse === category ? 'bg-[#800000] text-white' : 'bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-600 mb-2">
        Showing {filteredStudents.length} pending students
      </p>

      <div className="overflow-x-auto max-w-full border rounded shadow-sm">
  <table className="min-w-[800px] w-full border-collapse border border-gray-300">
    <thead>
      <tr className="bg-gray-100">
        <th className="border border-gray-300 p-2">Name</th>
        <th className="border border-gray-300 p-2">Course</th>
        <th className="border border-gray-300 p-2">Gender</th>
        <th className="border border-gray-300 p-2">Status</th>
        <th className="border border-gray-300 p-2">Action</th>
      </tr>
    </thead>
    <tbody>
  {filteredStudents.length === 0 ? (
    <tr>
      <td colSpan={5} className="text-center text-gray-500 py-4">
        ✅ All students have been allotted rooms. No pending students left for manual allocation.
      </td>
    </tr>
  ) : (
    filteredStudents.map((student) => (
      <tr key={student.id} className="hover:bg-gray-50 transition-all duration-200">
        <td className="border border-gray-300 p-2">
          {student.profiles_db?.[0]?.name || 'N/A'}
        </td>
        <td className="border border-gray-300 p-2">{student.course}</td>
        <td className="border border-gray-300 p-2">{student.gender}</td>
        <td className="border border-gray-300 p-2">Pending</td>
        <td className="border border-gray-300 p-2">
          <button
            onClick={() => onSelectStudent(student.student_id)}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 disabled:opacity-50"
            disabled={loading}
          >
            Allocate Manually
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>

  </table>
</div>
    </div>
  );
};

export default StudentList;
