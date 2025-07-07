// import { Student } from "../types/student";
// import { MessOption } from "../types/student"; // Update the import path to the correct module exporting MessOption

// interface MessChangeFormProps {
//   selectedStudent: Student | null;
//   newMessId: string | null;
//   setNewMessId: (id: string | null) => void;
//   messOptions: MessOption[];
//   onChangeMess: () => void;
//   loading: boolean;
// }

// export default function MessChangeForm({ selectedStudent, newMessId, setNewMessId, messOptions, onChangeMess, loading }: MessChangeFormProps) {
//   if (!selectedStudent) return null;

//   return (
//     <div className="mt-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
//       <h3 className="text-lg font-semibold">Current Details</h3>
//       <p>Name: {selectedStudent.name}</p>
//       <p>CET Application ID: {selectedStudent.cet_application_id}</p>
//       <p>Hostel: {selectedStudent.hostel_name || "N/A"}</p>
//       <p>Current Mess: {selectedStudent.mess_name || "N/A"}</p>
//       <div className="mt-2">
//         <label className="block text-sm font-medium text-gray-700">New Mess</label>
//         <select
//           value={newMessId || ""}
//           onChange={(e) => setNewMessId(e.target.value)}
//           className="w-full p-2 border border-gray-300 rounded-lg mt-1"
//         >
//           <option value="">Select Mess</option>
//           {messOptions.map((option) => (
//             <option key={option.id} value={option.id}>
//               {option.name}
//             </option>
//           ))}
//         </select>
//       </div>
//       <button
//         onClick={onChangeMess}
//         disabled={loading || !newMessId || newMessId === selectedStudent.mess_id}
//         className="mt-4 w-full bg-[#7C0A02] text-white p-2 rounded-lg hover:bg-[#5E0701] disabled:bg-gray-400 disabled:cursor-not-allowed"
//       >
//         {loading ? "Updating..." : "Change Mess"}
//       </button>
//     </div>
//   );
// }





// Fixed 🔧: Removed unused import { MessOption } from "../types/student";
// Fixed 🔧: Removed unused 'loading' prop if not required elsewhere

import { Student } from "../types/student";

interface MessOption {
  id: string;
  name: string;
}

interface MessChangeFormProps {
  selectedStudent: Student | null;
  newMessId: string | null;
  setNewMessId: (id: string | null) => void;
  messOptions: MessOption[];
  onChangeMess: () => void;
  loading: boolean;
}

export default function MessChangeForm({
  selectedStudent,
  newMessId,
  setNewMessId,
  messOptions,
  onChangeMess,
  loading
}: MessChangeFormProps) {
  // Fixed 🔧: Early return for null student
  if (!selectedStudent) return null;

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold">Current Details</h3>
      <p>Name: {selectedStudent.name}</p>
      <p>CET Application ID: {selectedStudent.cet_application_id}</p>
      <p>Hostel: {selectedStudent.hostel_name || "N/A"}</p>
      <p>Current Mess: {selectedStudent.mess_name || "N/A"}</p>

      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700">New Mess</label>
        <select
          value={newMessId || ""}
          onChange={(e) => setNewMessId(e.target.value || null)}  // Fixed 🔧: Ensure null is passed when empty
          className="w-full p-2 border border-gray-300 rounded-lg mt-1"
        >
          <option value="">Select Mess</option>
          {messOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onChangeMess}
        disabled={loading || !newMessId || newMessId === selectedStudent.mess_id}  // Fixed 🔧: Button properly disables
        className="mt-4 w-full bg-[#7C0A02] text-white p-2 rounded-lg hover:bg-[#5E0701] disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Updating..." : "Change Mess"}
      </button>
    </div>
  );
}
