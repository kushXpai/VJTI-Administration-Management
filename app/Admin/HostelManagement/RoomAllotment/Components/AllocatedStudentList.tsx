import { useCallback } from 'react';
import { StudentApplication, Hostel, Mess } from '../Types/Type';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { filterByCourse } from '../utils/courseUtils';

interface AllocatedStudentListProps {
  students: StudentApplication[];
  hostels: Hostel[];
  messes: Mess[];
  selectedCourse: string;
  onCourseSelect: (course: string) => void;
  selectedGender: string;
  onGenderChange: (gender: string) => void;
}

const AllocatedStudentList: React.FC<AllocatedStudentListProps> = ({
  students,
  hostels,
  messes,
  selectedCourse,
  onCourseSelect,
  selectedGender,
  onGenderChange,
}) => {
  const filteredStudents = filterByCourse(
    students.filter((s) => s.room_id && s.block_allotment_status === 'Allotted'),
    selectedCourse
  ).filter((s) => selectedGender === 'All' || s.gender === selectedGender);

  const generatePDF = useCallback(async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const imageUrl = '/images/vjti_logo1.png'; // served from public/images/

    try {
      const imageResponse = await fetch(imageUrl);
      const blob = await imageResponse.blob();

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;

        // Add Logo
        doc.addImage(base64data, 'PNG',  10, 10, 20, 23);

        // Title
        doc.setFontSize(16);
        doc.text('Room & Mess Allotment List', pageWidth / 2, 20, { align: 'center' });

        // Table
        autoTable(doc, {
          head: [['Name', 'Course', 'Gender', 'Hostel', 'Mess']],
          body: filteredStudents.map((student) => {
            const hostel = hostels.find((h) => h.hostel_id === student.hostel_id);
            const mess = messes.find((m) => m.mess_id === student.mess_id);
            return [
              student.profiles_db?.[0]?.name || 'N/A',
              student.course,
              student.gender,
              hostel?.name || 'N/A',
              mess?.name || 'N/A',
            ];
          }),
          startY: 35,
        });

        doc.save('room_allotment_list.pdf');
      };

      reader.readAsDataURL(blob);
    } catch (e) {
      console.error('Failed to load logo:', e);
    }
  }, [filteredStudents, hostels, messes]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-[#800000]">
        Allocated Students with Mess & Hostel
      </h2>

      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Filter by Course:</label>
          <select
            value={selectedCourse}
            onChange={(e) => onCourseSelect(e.target.value)}
            className="ml-2 border p-2 rounded"
          >
            <option value="All">All</option>
            <option value="Diploma">Diploma</option>
            <option value="BTech">BTech</option>
            <option value="MCA">MCA</option>
            <option value="MTech">MTech</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Filter by Gender:</label>
          <select
            value={selectedGender}
            onChange={(e) => onGenderChange(e.target.value)}
            className="ml-2 border p-2 rounded"
          >
            <option value="All">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <button
          onClick={generatePDF}
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
        >
          Download PDF
        </button>
      </div>

      <div className="overflow-x-auto max-w-full border rounded shadow-sm">
  <table className="min-w-[800px] w-full border-collapse border border-gray-300">
    <thead>
      <tr className="bg-gray-100">
        <th className="border border-gray-300 p-2 text-left">Name</th>
        <th className="border border-gray-300 p-2 text-left">Course</th>
        <th className="border border-gray-300 p-2 text-left">Gender</th>
        <th className="border border-gray-300 p-2 text-left">Hostel</th>
        <th className="border border-gray-300 p-2 text-left">Mess</th>
      </tr>
    </thead>
    <tbody>
      {filteredStudents.map((student) => {
        const hostel = hostels.find((h) => h.hostel_id === student.hostel_id);
        const mess = messes.find((m) => m.mess_id === hostel?.mess_id);
        return (
          <tr key={student.id} className="hover:bg-gray-50 transition-all duration-200">
            <td className="border border-gray-300 p-2">
              {student.profiles_db?.[0]?.name || 'N/A'}
            </td>
            <td className="border border-gray-300 p-2">{student.course}</td>
            <td className="border border-gray-300 p-2">{student.gender}</td>
            <td className="border border-gray-300 p-2">{hostel?.name || 'N/A'}</td>
            <td className="border border-gray-300 p-2">{mess?.name || 'N/A'}</td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

    </div>
  );
};

export default AllocatedStudentList;
