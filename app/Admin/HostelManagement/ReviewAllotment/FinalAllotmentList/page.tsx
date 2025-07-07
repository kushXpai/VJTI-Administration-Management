// // app/Admin/HostelManagement/ReviewAllotment/FinalAllotmentList/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "../../../../../supabase/supabaseClient";
// import Image from "next/image";
// import LoadingSpinner from "../Utilities/Components/LoadingSpinner";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// interface FinalAllotmentEntry {
//   student_name: string;
//   gender: string;
//   course: string;
//   hostel_name: string;
//   room_number: number;
// }

// const courseCategoryMap: Record<string, string> = {
//   "Diploma in Civil Engineering": "Diploma",
//   "Diploma in Electrical Engineering": "Diploma",
//   "Diploma in Electronics Engineering": "Diploma",
//   "Diploma in Mechanical Engineering": "Diploma",
//   "Diploma in Textile Manufacturers": "Diploma",
//   "Diploma in Chemical Engineering": "Diploma",

//   "B.Tech Degree in Civil Engineering": "BTech",
//   "B.Tech Degree in Computer Engineering": "BTech",
//   "B.Tech Degree in Electrical Engineering": "BTech",
//   "B.Tech Degree in Electronics Engineering": "BTech",
//   "B.Tech Degree in Electronics & Telecommunication Engineering": "BTech",
//   "B.Tech Degree in Information Technology": "BTech",
//   "B.Tech Degree in Mechanical Engineering": "BTech",
//   "B.Tech Degree in Production Engineering": "BTech",
//   "B.Tech Degree in Textile Technology": "BTech",

//   "Master of Computer Application": "MCA",

//   "M.Tech Degree in Civil Engineering": "MTech",
//   "M.Tech Degree in Computer Engineering": "MTech",
//   "M.Tech Degree in Electrical Engineering": "MTech",
//   "M.Tech Degree in Internet of Things (IOT)": "MTech",
//   "M.Tech Degree in Electronics & Telecommunication Engineering": "MTech",
//   "M.Tech Degree in Mechanical Engineering": "MTech",
//   "M.Tech Degree in Production Engineering": "MTech",
//   "M.Tech Degree in Project Management": "MTech",
//   "M.Tech Degree in Technical Textile": "MTech",
//   "M.Tech Degree in Defence Technology": "MTech",
// };

// export default function FinalAllotmentListPage() {
//   const [finalList, setFinalList] = useState<FinalAllotmentEntry[]>([]);
//   const [filteredList, setFilteredList] = useState<FinalAllotmentEntry[]>([]);
//   const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
//   const [selectedGender, setSelectedGender] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     fetchFinalList();
//   }, []);

//   useEffect(() => {
//     filterList();
//   }, [selectedCourse, selectedGender, finalList]);

//   const fetchFinalList = async () => {
//     setIsLoading(true);
//     try {
//       const { data: applications, error } = await supabase
//         .from("hostel_applications_db")
//         .select(
//           `student_id, gender, course, room_db!hostel_applications_db_room_id_fkey(number, hostel_id), profiles_db(name), hostel_db(name)`
//         )
//         .eq("review_fee_status", "Paid")
//         .eq("final_allotment_status", true)
//         .order("course", { ascending: true });

//       if (error) throw error;

//       const mapped: FinalAllotmentEntry[] = applications.map((entry: any) => ({
//         student_name: entry.profiles_db?.name || "Unknown",
//         gender: entry.gender,
//         course: entry.course,
//         hostel_name: entry.hostel_db?.name || "Not Assigned",
//         room_number: entry.room_db?.number || 0,
//       }));

//       setFinalList(mapped);
//     } catch (error) {
//       console.error("Error fetching final allotment list:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const filterList = () => {
//     let list = [...finalList];
//     if (selectedCourse) {
//       list = list.filter(entry => courseCategoryMap[entry.course] === selectedCourse);
//     }
//     if (selectedGender) {
//       list = list.filter(entry => entry.gender === selectedGender);
//     }
//     setFilteredList(list);
//   };

//   const exportToPDF = () => {
//     const doc = new jsPDF();
//     doc.text("Final Allotment List", 14, 16);

//     autoTable(doc, {
//       head: [["Student Name", "Gender", "Course", "Hostel Name", "Room Number"]],
//       body: filteredList.map(entry => [
//         entry.student_name,
//         entry.gender,
//         entry.course,
//         entry.hostel_name,
//         entry.room_number.toString()
//       ]),
//       startY: 20,
//       theme: "striped",
//       styles: { fontSize: 10 },
//     });

//     const fileName = `FinalAllotmentList_${selectedCourse ?? "AllCourses"}_${selectedGender ?? "AllGenders"}.pdf`;
//     doc.save(fileName);
//   };

//   if (isLoading) return <LoadingSpinner />;

//   const courseOptions = ["Diploma", "BTech", "MTech", "MCA"];
//   const uniqueGenders = [...new Set(finalList.map(entry => entry.gender))];

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-50">
//       <header className="flex justify-between items-center p-4 border-b border-gray-300 bg-white shadow">
//         <div className="flex items-center gap-4">
//           <Image src="/images/vjti_logo.svg" alt="VJTI Logo" width={50} height={50} />
//           <div>
//             <h1 className="text-xl font-bold text-[#800000]">Veermata Jijabai Technological Institute</h1>
//             <p className="text-sm text-gray-600">Matunga East, Mumbai, Maharashtra 400019</p>
//           </div>
//         </div>
//         <div className="flex flex-col">
//           <h1 className="text-xl font-bold tracking-tight text-[#800000]">Final Allotment List</h1>
//           <p className="text-sm text-gray-600">Admin Management Panel</p>
//         </div>
//       </header>

//       <div className="w-1/4 p-4 flex gap-4 my-4">
//         <select onChange={e => setSelectedCourse(e.target.value || null)} className="p-2 border rounded">
//           <option value="">All Courses</option>
//           {courseOptions.map(course => (
//             <option key={course} value={course}>{course}</option>
//           ))}
//         </select>

//         <select onChange={e => setSelectedGender(e.target.value || null)} className="p-2 border rounded">
//           <option value="">All Genders</option>
//           {uniqueGenders.map(gender => (
//             <option key={gender} value={gender}>{gender}</option>
//           ))}
//         </select>

//         <button onClick={exportToPDF} className="bg-[#800000] text-white px-4 py-2 rounded hover:bg-red-700">
//           Export PDF
//         </button>
//       </div>

//       {filteredList.length === 0 ? (
//         <p className="text-center text-lg text-gray-600">No final allotments found.</p>
//       ) : (
//         <div className=" overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200 shadow-md">
//             <thead className="bg-[#800000] text-white">
//               <tr>
//                 <th className="py-3 px-4 text-left">Student Name</th>
//                 <th className="py-3 px-4 text-left">Gender</th>
//                 <th className="py-3 px-4 text-left">Course</th>
//                 <th className="py-3 px-4 text-left">Hostel Name</th>
//                 <th className="py-3 px-4 text-left">Room Number</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredList.map((entry, idx) => (
//                 <tr key={idx} className="border-b even:bg-gray-50">
//                   <td className="py-2 px-4">{entry.student_name}</td>
//                   <td className="py-2 px-4">{entry.gender}</td>
//                   <td className="py-2 px-4">{entry.course}</td>
//                   <td className="py-2 px-4">{entry.hostel_name}</td>
//                   <td className="py-2 px-4">{entry.room_number}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }



//Fixed?? /

// app/Admin/HostelManagement/ReviewAllotment/FinalAllotmentList/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../../../supabase/supabaseClient";
import Image from "next/image";
import LoadingSpinner from "../Utilities/Components/LoadingSpinner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface FinalAllotmentEntry {
  student_name: string;
  gender: string;
  course: string;
  hostel_name: string;
  room_number: number;
}

const courseCategoryMap: Record<string, string> = {
  "Diploma in Civil Engineering": "Diploma",
  "Diploma in Electrical Engineering": "Diploma",
  "Diploma in Electronics Engineering": "Diploma",
  "Diploma in Mechanical Engineering": "Diploma",
  "Diploma in Textile Manufacturers": "Diploma",
  "Diploma in Chemical Engineering": "Diploma",

  "B.Tech Degree in Civil Engineering": "BTech",
  "B.Tech Degree in Computer Engineering": "BTech",
  "B.Tech Degree in Electrical Engineering": "BTech",
  "B.Tech Degree in Electronics Engineering": "BTech",
  "B.Tech Degree in Electronics & Telecommunication Engineering": "BTech",
  "B.Tech Degree in Information Technology": "BTech",
  "B.Tech Degree in Mechanical Engineering": "BTech",
  "B.Tech Degree in Production Engineering": "BTech",
  "B.Tech Degree in Textile Technology": "BTech",

  "Master of Computer Application": "MCA",

  "M.Tech Degree in Civil Engineering": "MTech",
  "M.Tech Degree in Computer Engineering": "MTech",
  "M.Tech Degree in Electrical Engineering": "MTech",
  "M.Tech Degree in Internet of Things (IOT)": "MTech",
  "M.Tech Degree in Electronics & Telecommunication Engineering": "MTech",
  "M.Tech Degree in Mechanical Engineering": "MTech",
  "M.Tech Degree in Production Engineering": "MTech",
  "M.Tech Degree in Project Management": "MTech",
  "M.Tech Degree in Technical Textile": "MTech",
  "M.Tech Degree in Defence Technology": "MTech",
};

export default function FinalAllotmentListPage() {
  const [finalList, setFinalList] = useState<FinalAllotmentEntry[]>([]);
  const [filteredList, setFilteredList] = useState<FinalAllotmentEntry[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFinalList = async () => {
    setIsLoading(true);
    try {
      const { data: applications, error } = await supabase
        .from("hostel_applications_db")
        .select(
          `student_id, gender, course, room_db!hostel_applications_db_room_id_fkey(number, hostel_id), profiles_db(name), hostel_db(name)`
        )
        .eq("review_fee_status", "Paid")
        .eq("final_allotment_status", true)
        .order("course", { ascending: true });

      if (error) throw error;

      const mapped: FinalAllotmentEntry[] = applications.map((entry: any) => ({
        student_name: entry.profiles_db?.name || "Unknown",
        gender: entry.gender,
        course: entry.course,
        hostel_name: entry.hostel_db?.name || "Not Assigned",
        room_number: entry.room_db?.number || 0,
      }));

      setFinalList(mapped);
    } catch (error) {
      console.error("Error fetching final allotment list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterList = useCallback(() => {
    let list = [...finalList];
    if (selectedCourse) {
      list = list.filter(entry => courseCategoryMap[entry.course] === selectedCourse);
    }
    if (selectedGender) {
      list = list.filter(entry => entry.gender === selectedGender);
    }
    setFilteredList(list);
  }, [finalList, selectedCourse, selectedGender]);

  useEffect(() => {
    fetchFinalList();
  }, []);

  useEffect(() => {
    filterList();
  }, [filterList]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Final Allotment List", 14, 16);

    autoTable(doc, {
      head: [["Student Name", "Gender", "Course", "Hostel Name", "Room Number"]],
      body: filteredList.map(entry => [
        entry.student_name,
        entry.gender,
        entry.course,
        entry.hostel_name,
        entry.room_number.toString(),
      ]),
      startY: 20,
      theme: "striped",
      styles: { fontSize: 10 },
    });

    const fileName = `FinalAllotmentList_${selectedCourse ?? "AllCourses"}_${selectedGender ?? "AllGenders"}.pdf`;
    doc.save(fileName);
  };

  if (isLoading) return <LoadingSpinner />;

  const courseOptions = ["Diploma", "BTech", "MTech", "MCA"];
  const uniqueGenders = [...new Set(finalList.map(entry => entry.gender))];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex justify-between items-center p-4 border-b border-gray-300 bg-white shadow">
        <div className="flex items-center gap-4">
          <Image src="/images/vjti_logo.svg" alt="VJTI Logo" width={50} height={50} />
          <div>
            <h1 className="text-xl font-bold text-[#800000]">Veermata Jijabai Technological Institute</h1>
            <p className="text-sm text-gray-600">Matunga East, Mumbai, Maharashtra 400019</p>
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-[#800000]">Final Allotment List</h1>
          <p className="text-sm text-gray-600">Admin Management Panel</p>
        </div>
      </header>

      <div className="w-1/4 p-4 flex gap-4 my-4">
        <select onChange={e => setSelectedCourse(e.target.value || null)} className="p-2 border rounded">
          <option value="">All Courses</option>
          {courseOptions.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>

        <select onChange={e => setSelectedGender(e.target.value || null)} className="p-2 border rounded">
          <option value="">All Genders</option>
          {uniqueGenders.map(gender => (
            <option key={gender} value={gender}>{gender}</option>
          ))}
        </select>

        <button onClick={exportToPDF} className="bg-[#800000] text-white px-4 py-2 rounded hover:bg-red-700">
          Export PDF
        </button>
      </div>

      {filteredList.length === 0 ? (
        <p className="text-center text-lg text-gray-600">No final allotments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md">
            <thead className="bg-[#800000] text-white">
              <tr>
                <th className="py-3 px-4 text-left">Student Name</th>
                <th className="py-3 px-4 text-left">Gender</th>
                <th className="py-3 px-4 text-left">Course</th>
                <th className="py-3 px-4 text-left">Hostel Name</th>
                <th className="py-3 px-4 text-left">Room Number</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((entry, idx) => (
                <tr key={idx} className="border-b even:bg-gray-50">
                  <td className="py-2 px-4">{entry.student_name}</td>
                  <td className="py-2 px-4">{entry.gender}</td>
                  <td className="py-2 px-4">{entry.course}</td>
                  <td className="py-2 px-4">{entry.hostel_name}</td>
                  <td className="py-2 px-4">{entry.room_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
