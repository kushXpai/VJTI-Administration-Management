import { Student } from "../types/student";

interface StudentSelectProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelect: (student: Student) => void;
  loading: boolean;
}

export default function StudentSelect({ students, selectedStudent, onSelect, loading }: StudentSelectProps) {
  if (loading || students.length === 0) return null;

  return (
    <div className="mt-4 max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
      {students.map((student) => (
        <div
          key={student.student_id}
          onClick={() => onSelect(student)}
          className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedStudent?.student_id === student.student_id ? "bg-[#7C0A02] text-white" : ""}`}
        >
          <p><strong>{student.name}</strong> (ID: {student.student_id}, CET: {student.cet_application_id})</p>
          <p>Mess: {student.mess_name || "N/A"}, Hostel: {student.hostel_name || "N/A"}</p>
        </div>
      ))}
    </div>
  );
}