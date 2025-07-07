// "use client"; // Mark as Client Component

// import { useState } from "react";
// import { useFetchMessOptions } from "./hooks/useFetchMessOptions";
// import { useSearchStudents } from "./hooks/useSearchStudents";
// import Header from "@/app/Components/Header";
// import Footer from "@/app/Components/Footer";
// import StudentSearchInput from "./components/StudentSearchInput";
// import StudentSelect from "./components/StudentSelect";
// import MessChangeForm from "./components/MessChangeForm";
// import ConfirmDialog from "./components/ConfirmDialog";
// import { Student } from "./types/student";

// export default function AdminMessChange() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
//   const [newMessId, setNewMessId] = useState<string | null>(null);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [searchTriggered, setSearchTriggered] = useState(false);

//   const { messOptions, loading: messLoading, error: messError } = useFetchMessOptions();
//   const { students, loading: searchLoading, message } = useSearchStudents(searchTerm, searchTriggered, setSearchTriggered);

//   const handleSearch = (term: string) => {
//     console.log("Search button clicked, triggering search with term:", term);
//     setSearchTriggered(true);
//     setSelectedStudent(null);
//     setNewMessId(null);
//   };

//   const handleStudentSelect = (student: Student) => {
//     setSelectedStudent(student);
//     setNewMessId(student.mess_id || null);
//     console.log("Selected student from list:", student);
//   };

//   const handleUpdateMessBlock = () => {
//     if (!selectedStudent || !newMessId || newMessId === selectedStudent.mess_id) {
//       setMessage("Please select a different mess.");
//       return;
//     }
//     setShowConfirm(true);
//   };

//   const handleConfirmChange = async () => {
//     if (!selectedStudent || !newMessId || newMessId === selectedStudent.mess_id) {
//       setMessage("Please select a different mess.");
//       setShowConfirm(false);
//       return;
//     }

//     const supabase = (await import("@supabase/supabase-js")).createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//     );

//     const { error } = await supabase
//       .from("hostelite_db")
//       .update({ mess_id: newMessId })
//       .eq("student_id", selectedStudent.student_id);

//     if (error) {
//       console.error("Error updating mess:", error.message, error.details);
//       setMessage(`Failed to update mess: ${error.message}`);
//     } else {
//       setMessage(`Mess changed successfully for ${selectedStudent.name} (ID: ${selectedStudent.student_id}) from ${selectedStudent.mess_name || "N/A"} to ${messOptions.find(m => m.id === newMessId)?.name || "N/A"}`);
//       console.log(`Mess change: ${selectedStudent.name} (ID: ${selectedStudent.student_id}) - ${selectedStudent.mess_name || "N/A"} → ${messOptions.find(m => m.id === newMessId)?.name || "N/A"}`);
//       setSelectedStudent({ ...selectedStudent, mess_id: newMessId, mess_name: messOptions.find(m => m.id === newMessId)?.name || "N/A" });
//     }
//     setShowConfirm(false);
//   };

//   const setMessage = (msg: string) => {
//     setMessage(msg); // This should be a state setter, but we'll use a local function for now
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-200 text-black">
//       <div className="flex-1 flex flex-row">
//         <main className="flex-1 p-8">
//           <Header
//             rightContent={
//               <div className="flex flex-col items-end">
//                 <span className="text-2xl font-extrabold text-[#800000] tracking-tight drop-shadow-sm">
//                   Admin Mess Change
//                 </span>
//                 <span className="text-base text-gray-500 font-medium">Manage Student Mess Assignments</span>
//               </div>
//             }
//           />
//           <div className="max-w-2xl mx-auto mt-6">
//             <StudentSearchInput
//               onSearch={handleSearch}
//               loading={messLoading || searchLoading}
//               searchTerm={searchTerm}
//               setSearchTerm={setSearchTerm}
//             />
//             {(messLoading || searchLoading) && <p className="text-center py-2 text-gray-600">Loading...</p>}
//             {!messLoading && !searchLoading && students.length > 0 && (
//               <StudentSelect
//                 students={students}
//                 selectedStudent={selectedStudent}
//                 onSelect={handleStudentSelect}
//                 loading={searchLoading}
//               />
//             )}
//             {!messLoading && !searchLoading && message && (
//               <p className={`mt-4 text-center p-2 rounded-lg ${message.includes("successfully") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
//                 {message}
//               </p>
//             )}
//             <MessChangeForm
//               selectedStudent={selectedStudent}
//               newMessId={newMessId}
//               setNewMessId={setNewMessId}
//               messOptions={messOptions}
//               onChangeMess={handleUpdateMessBlock}
//               loading={messLoading || searchLoading}
//             />
//           </div>
//         </main>
//       </div>
//       <Footer />
//       <ConfirmDialog
//         show={showConfirm}
//         onClose={() => setShowConfirm(false)}
//         onConfirm={handleConfirmChange}
//         selectedStudent={selectedStudent}
//         newMessId={newMessId}
//         messOptions={messOptions}
//         loading={messLoading || searchLoading}
//       />
//     </div>
//   );
// }


// Fixed 🔧: Mark as Client Component
"use client";

import { useState } from "react";
import { useFetchMessOptions } from "./hooks/useFetchMessOptions";
import { useSearchStudents } from "./hooks/useSearchStudents";
import Header from "@/app/Components/Header";
import Footer from "@/app/Components/Footer";
import StudentSearchInput from "./components/StudentSearchInput";
import StudentSelect from "./components/StudentSelect";
import MessChangeForm from "./components/MessChangeForm";
import ConfirmDialog from "./components/ConfirmDialog";
import { Student } from "./types/student";

export default function AdminMessChange() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newMessId, setNewMessId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);

  // Fixed 🔧: Removed unused `messError`
  const { messOptions, loading: messLoading } = useFetchMessOptions();
  const { students, loading: searchLoading, message: searchMessage } = useSearchStudents(searchTerm, searchTriggered, setSearchTriggered);

  // Fixed 🔧: Added message state to avoid recursion issue
  const [message, setMessage] = useState<string | null>(null);

  const handleSearch = (term: string) => {
    console.log("Search button clicked, triggering search with term:", term);
    setSearchTriggered(true);
    setSelectedStudent(null);
    setNewMessId(null);
    setMessage(null);
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setNewMessId(student.mess_id || null);
    setMessage(null);
    console.log("Selected student from list:", student);
  };

  const handleUpdateMessBlock = () => {
    if (!selectedStudent || !newMessId || newMessId === selectedStudent.mess_id) {
      setMessage("Please select a different mess.");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmChange = async () => {
    if (!selectedStudent || !newMessId || newMessId === selectedStudent.mess_id) {
      setMessage("Please select a different mess.");
      setShowConfirm(false);
      return;
    }

    const supabase = (await import("@supabase/supabase-js")).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from("hostelite_db")
      .update({ mess_id: newMessId })
      .eq("student_id", selectedStudent.student_id);

    if (error) {
      console.error("Error updating mess:", error.message, error.details);
      setMessage(`Failed to update mess: ${error.message}`);
    } else {
      const newMessName = messOptions.find(m => m.id === newMessId)?.name || "N/A";
      setMessage(`Mess changed successfully for ${selectedStudent.name} (ID: ${selectedStudent.student_id}) from ${selectedStudent.mess_name || "N/A"} to ${newMessName}`);
      console.log(`Mess change: ${selectedStudent.name} (ID: ${selectedStudent.student_id}) - ${selectedStudent.mess_name || "N/A"} → ${newMessName}`);
      setSelectedStudent({ ...selectedStudent, mess_id: newMessId, mess_name: newMessName });
    }

    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-200 text-black">
      <div className="flex-1 flex flex-row">
        <main className="flex-1 p-8">
          <Header
            rightContent={
              <div className="flex flex-col items-end">
                <span className="text-2xl font-extrabold text-[#800000] tracking-tight drop-shadow-sm">
                  Admin Mess Change
                </span>
                <span className="text-base text-gray-500 font-medium">Manage Student Mess Assignments</span>
              </div>
            }
          />
          <div className="max-w-2xl mx-auto mt-6">
            <StudentSearchInput
              onSearch={handleSearch}
              loading={messLoading || searchLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

            {(messLoading || searchLoading) && <p className="text-center py-2 text-gray-600">Loading...</p>}

            {!messLoading && !searchLoading && students.length > 0 && (
              <StudentSelect
                students={students}
                selectedStudent={selectedStudent}
                onSelect={handleStudentSelect}
                loading={searchLoading}
              />
            )}

            {!messLoading && !searchLoading && (message || searchMessage) && (
              <p className={`mt-4 text-center p-2 rounded-lg ${message?.includes("successfully") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {message || searchMessage}
              </p>
            )}

            <MessChangeForm
              selectedStudent={selectedStudent}
              newMessId={newMessId}
              setNewMessId={setNewMessId}
              messOptions={messOptions}
              onChangeMess={handleUpdateMessBlock}
              loading={messLoading || searchLoading}
            />
          </div>
        </main>
      </div>

      <Footer />

      <ConfirmDialog
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmChange}
        selectedStudent={selectedStudent}
        newMessId={newMessId}
        messOptions={messOptions}
        loading={messLoading || searchLoading}
      />
    </div>
  );
}
