// 'use client';

// import { useState, useEffect } from 'react';
// import { useStudentSearch } from '../hooks/useStudentSearch';
// import { toast } from 'react-hot-toast';
// import Select from 'react-select';
// import Modal from 'react-modal';
// import { StudentResult, Room } from '../types';

// // Set app element dynamically on client side
// if (typeof window !== 'undefined') {
//   const appElement = document.getElementById('__next') || document.body;
//   Modal.setAppElement(appElement);
// }

// const SearchComponent = ({ onSwap }: { onSwap: (students: StudentResult[]) => void }) => {
//   const {
//     results,
//     error,
//     loading,
//     searchStudents,
//     updateStudentRoom,
//     updateError,
//     updateLoading,
//     buildings,
//     rooms,
//     fetchBuildings,
//     fetchRooms,
//   } = useStudentSearch();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
//   const [building, setBuilding] = useState('');
//   const [room, setRoom] = useState('');
//   const [selectedStudents, setSelectedStudents] = useState<StudentResult[]>([]);

//   useEffect(() => {
//     fetchBuildings();
//   }, []);

//   useEffect(() => {
//     if (building) {
//       fetchRooms(building);
//     } else {
//       setRoom('');
//     }
//   }, [building]);

//   const handleSearch = async () => {
//     console.log('Searching with term:', searchTerm);
//     await searchStudents(searchTerm);
//     if (error) {
//       toast.error(error);
//     }
//     // Do not clear selectedStudents to persist selections
//   };

//   const handleSelectStudent = (student: StudentResult) => {
//     setSelectedStudents((prev) => {
//       console.log('Selecting student:', student.id, 'Current selections:', prev.map((s) => s.id));
//       if (prev.find((s) => s.id === student.id)) {
//         // Deselect if already selected
//         return prev.filter((s) => s.id !== student.id);
//       }
//       if (prev.length >= 2) {
//         toast.error('You can select only two students for swapping.');
//         return prev;
//       }
//       if (prev.some((s) => s.id === student.id)) {
//         toast.error('Student already selected.');
//         return prev;
//       }
//       return [...prev, student];
//     });
//   };

//   const handleClearSelections = () => {
//     setSelectedStudents([]);
//     console.log('Cleared selections');
//   };

//   const openChangeModal = (student: StudentResult) => {
//     setSelectedStudent(student);
//     setIsChangeModalOpen(true);
//   };

//   const handleChangeRoom = async () => {
//     if (!selectedStudent || !building || !room) {
//       toast.error('Please select a building and room.');
//       return;
//     }
//     const success = await updateStudentRoom(selectedStudent.id, room, building);
//     if (success) {
//       toast.success('Room updated successfully!');
//       setIsChangeModalOpen(false);
//       setBuilding('');
//       setRoom('');
//     } else {
//       toast.error(updateError || 'Failed to update room.');
//     }
//   };

//   const handleSwapClick = () => {
//     if (selectedStudents.length !== 2) {
//       toast.error('Please select exactly two students to swap.');
//       return;
//     }
//     console.log('Opening swap modal with students:', selectedStudents.map((s) => s.id));
//     onSwap(selectedStudents);
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex gap-2">
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           placeholder="Enter CET ID or name"
//           className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           disabled={loading}
//         />
//         <button
//           onClick={handleSearch}
//           disabled={loading}
//           className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
//         >
//           {loading ? 'Searching...' : 'Search'}
//         </button>
//       </div>
//       {error && <p className="text-red-500">{error}</p>}
//       {results.length > 0 && (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white shadow-md rounded-md">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="p-2 text-left">Select</th>
//                 <th className="p-2 text-left">Name</th>
//                 <th className="p-2 text-left">CET ID</th>
//                 <th className="p-2 text-left">Course</th>
//                 <th className="p-2 text-left">Gender</th>
//                 <th className="p-2 text-left">Mobile</th>
//                 <th className="p-2 text-left">Room</th>
//                 <th className="p-2 text-left">Building</th>
//                 <th className="p-2 text-left">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {results.map((student) => (
//                 <tr key={student.id} className="border-t">
//                   <td className="p-2">
//                     <input
//                       type="checkbox"
//                       checked={selectedStudents.some((s) => s.id === student.id)}
//                       onChange={() => handleSelectStudent(student)}
//                     />
//                   </td>
//                   <td className="p-2">{student.name}</td>
//                   <td className="p-2">{student.cet_application_id}</td>
//                   <td className="p-2">{student.course}</td>
//                   <td className="p-2">{student.gender}</td>
//                   <td className="p-2">{student.mobile_number}</td>
//                   <td className="p-2">{student.room_number || '-'}</td>
//                   <td className="p-2">{student.building_name || '-'}</td>
//                   <td className="p-2">
//                     <button
//                       onClick={() => openChangeModal(student)}
//                       className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                     >
//                       Change Room
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <div className="mt-4 flex gap-2">
//             <button
//               onClick={handleSwapClick}
//               className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
//               disabled={selectedStudents.length !== 2}
//             >
//               Swap Rooms
//             </button>
//             <button
//               onClick={handleClearSelections}
//               className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
//               disabled={selectedStudents.length === 0}
//             >
//               Clear Selections
//             </button>
//           </div>
//         </div>
//       )}
//       <Modal
//         isOpen={isChangeModalOpen}
//         onRequestClose={() => setIsChangeModalOpen(false)}
//         className="max-w-md mx-auto mt-20 p-6 bg-white rounded-md shadow-lg"
//         overlayClassName="fixed inset-0 bg-black bg-opacity-50"
//       >
//         <h2 className="text-xl font-bold mb-4">Change Room</h2>
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium">Building</label>
//             <Select
//               options={buildings.map((b) => ({ value: b, label: b }))}
//               onChange={(opt) => {
//                 setBuilding(opt?.value || '');
//                 setRoom('');
//               }}
//               placeholder="Select Building"
//               className="mt-1"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium">Room</label>
//             <Select
//               options={rooms.map((r) => ({ value: r.room_number, label: `${r.room_number} (Vacant: ${r.vacant})` }))}
//               onChange={(opt) => setRoom(opt?.value || '')}
//               placeholder="Select Room"
//               className="mt-1"
//               isDisabled={!building}
//             />
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={handleChangeRoom}
//               disabled={updateLoading || !building || !room}
//               className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
//             >
//               {updateLoading ? 'Saving...' : 'Save'}
//             </button>
//             <button
//               onClick={() => setIsChangeModalOpen(false)}
//               className="flex-1 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//           {updateError && <p className="text-red-500">{updateError}</p>}
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default SearchComponent;




// last working model



// 'use client';

// import { useState, useEffect } from 'react';
// import useStudentSearch from '../hooks/useStudentSearch';
// import { toast } from 'react-hot-toast';
// import Select from 'react-select';
// import Modal from 'react-modal';
// import { StudentResult, Room } from '../types';

// // Set app element dynamically on client side
// if (typeof window !== 'undefined') {
//   const appElement = document.getElementById('__next') || document.body;
//   Modal.setAppElement(appElement);
// }

// const SearchComponent = ({ onSwap }: { onSwap: (students: StudentResult[]) => void }) => {
//   const {
//     results,
//     error,
//     loading,
//     searchStudents,
//     updateStudentRoom,
//     updateError,
//     updateLoading,
//     buildings,
//     rooms,
//     fetchBuildings,
//     fetchRooms,
//   } = useStudentSearch();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
//   const [building, setBuilding] = useState('');
//   const [room, setRoom] = useState('');
//   const [selectedStudents, setSelectedStudents] = useState<StudentResult[]>([]);

//   useEffect(() => {
//     fetchBuildings();
//   }, []);

//   useEffect(() => {
//     if (building) {
//       fetchRooms(building);
//     } else {
//       setRoom('');
//     }
//   }, [building]);

//   const handleSearch = async () => {
//     console.log('Searching with term:', searchTerm);
//     await searchStudents(searchTerm);
//     if (error) {
//       toast.error(error);
//     }
//   };

//   const handleSelectStudent = (student: StudentResult) => {
//     setSelectedStudents((prev) => {
//       console.log('Selecting student:', student.id, 'Current selections:', prev.map((s) => s.id));
//       if (prev.find((s) => s.id === student.id)) {
//         return prev.filter((s) => s.id !== student.id);
//       }
//       if (prev.length >= 2) {
//         toast.error('You can select only two students for swapping.');
//         return prev;
//       }
//       if (prev.some((s) => s.id === student.id)) {
//         toast.error('Student already selected.');
//         return prev;
//       }
//       return [...prev, student];
//     });
//   };

//   const handleClearSelections = () => {
//     setSelectedStudents([]);
//     console.log('Cleared selections');
//   };

//   const openChangeModal = (student: StudentResult) => {
//     setSelectedStudent(student);
//     setIsChangeModalOpen(true);
//   };

//   const handleChangeRoom = async () => {
//     if (!selectedStudent || !building || !room) {
//       toast.error('Please select a building and room.');
//       return;
//     }
//     const success = await updateStudentRoom(selectedStudent.id, room, building);
//     if (success) {
//       toast.success('Room updated successfully!');
//       setIsChangeModalOpen(false);
//       setBuilding('');
//       setRoom('');
//     } else {
//       toast.error(updateError || 'Failed to update room.');
//     }
//   };

//   const handleSwapClick = () => {
//     if (selectedStudents.length !== 2) {
//       toast.error('Please select exactly two students to swap.');
//       return;
//     }
//     console.log('Opening swap modal with students:', selectedStudents.map((s) => s.id));
//     onSwap(selectedStudents);
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex gap-2">
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           placeholder="Enter CET ID or name"
//           className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           disabled={loading}
//         />
//         <button
//           onClick={handleSearch}
//           disabled={loading}
//           className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
//         >
//           {loading ? 'Searching...' : 'Search'}
//         </button>
//       </div>
//       {error && <p className="text-red-500">{error}</p>}
//       {results.length > 0 && (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white shadow-md rounded-md">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="p-2 text-left">Select</th>
//                 <th className="p-2 text-left">Name</th>
//                 <th className="p-2 text-left">CET ID</th>
//                 <th className="p-2 text-left">Course</th>
//                 <th className="p-2 text-left">Gender</th>
//                 <th className="p-2 text-left">Mobile</th>
//                 <th className="p-2 text-left">Room</th>
//                 <th className="p-2 text-left">Building</th>
//                 <th className="p-2 text-left">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {results.map((student) => (
//                 <tr key={student.id} className="border-t">
//                   <td className="p-2">
//                     <input
//                       type="checkbox"
//                       checked={selectedStudents.some((s) => s.id === student.id)}
//                       onChange={() => handleSelectStudent(student)}
//                     />
//                   </td>
//                   <td className="p-2">{student.name}</td>
//                   <td className="p-2">{student.cet_application_id}</td>
//                   <td className="p-2">{student.course}</td>
//                   <td className="p-2">{student.gender}</td>
//                   <td className="p-2">{student.mobile_number}</td>
//                   <td className="p-2">{student.room_number || '-'}</td>
//                   <td className="p-2">{student.building_name || '-'}</td>
//                   <td className="p-2">
//                     <button
//                       onClick={() => openChangeModal(student)}
//                       className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                     >
//                       Change Room
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <div className="mt-4 flex gap-2">
//             <button
//               onClick={handleSwapClick}
//               className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
//               disabled={selectedStudents.length !== 2}
//             >
//               Swap Rooms
//             </button>
//             <button
//               onClick={handleClearSelections}
//               className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
//               disabled={selectedStudents.length === 0}
//             >
//               Clear Selections
//             </button>
//           </div>
//         </div>
//       )}
//       <Modal
//         isOpen={isChangeModalOpen}
//         onRequestClose={() => setIsChangeModalOpen(false)}
//         className="max-w-md mx-auto mt-20 p-6 bg-white rounded-md shadow-lg"
//         overlayClassName="fixed inset-0 bg-black bg-opacity-50"
//       >
//         <h2 className="text-xl font-bold mb-4">Room Allocation</h2>
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium">Building</label>
//             <Select
//               options={buildings.map((b) => ({ value: b, label: b }))}
//               onChange={(opt) => {
//                 setBuilding(opt?.value || '');
//                 setRoom('');
//               }}
//               placeholder="Select Building"
//               className="mt-1"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium">Room</label>
//             <Select
//               options={rooms.map((r) => ({ value: r.room_number, label: `${r.room_number} (Vacant: ${r.vacant})` }))}
//               onChange={(opt) => setRoom(opt?.value || '')}
//               placeholder="Select Room"
//               className="mt-1"
//               isDisabled={!building}
//             />
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={handleChangeRoom}
//               disabled={updateLoading || !building || !room}
//               className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
//             >
//               {updateLoading ? 'Saving...' : 'Save'}
//             </button>
//             <button
//               onClick={() => setIsChangeModalOpen(false)}
//               className="flex-1 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//           {updateError && <p className="text-red-500">{updateError}</p>}
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export { SearchComponent };



// 'use client';

// import { useState, useEffect } from 'react';
// import useStudentSearch from '../hooks/useStudentSearch';
// import { toast } from 'react-hot-toast';
// import Select from 'react-select';
// import Modal from 'react-modal';
// import { StudentResult, Room } from '../types';

// // Set app element dynamically on client side
// if (typeof window !== 'undefined') {
//   const appElement = document.getElementById('__next') || document.body;
//   Modal.setAppElement(appElement);
// }

// const SearchComponent = ({ onSwap }: { onSwap: (students: StudentResult[]) => void }) => {
//   const {
//     results,
//     error,
//     loading,
//     searchStudents,
//     updateStudentRoom,
//     updateError,
//     updateLoading,
//     buildings,
//     rooms,
//     fetchBuildings,
//     fetchRooms,
//   } = useStudentSearch();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
//   const [building, setBuilding] = useState('');
//   const [room, setRoom] = useState('');
//   const [selectedStudents, setSelectedStudents] = useState<StudentResult[]>([]);

//   useEffect(() => {
//     fetchBuildings();
//   }, []);

//   useEffect(() => {
//     if (building) {
//       fetchRooms(building);
//     } else {
//       setRoom('');
//     }
//   }, [building]);

//   const handleSearch = async () => {
//     console.log('Searching with term:', searchTerm);
//     await searchStudents(searchTerm);
//     if (error) {
//       toast.error(error);
//     }
//   };

//   const handleSelectStudent = (student: StudentResult) => {
//     setSelectedStudents((prev) => {
//       console.log('Selecting student:', student.id, 'Current selections:', prev.map((s) => s.id));
//       if (prev.find((s) => s.id === student.id)) {
//         return prev.filter((s) => s.id !== student.id);
//       }
//       if (prev.length >= 2) {
//         toast.error('You can select only two students for swapping.');
//         return prev;
//       }
//       if (prev.some((s) => s.id === student.id)) {
//         toast.error('Student already selected.');
//         return prev;
//       }
//       return [...prev, student];
//     });
//   };

//   const handleClearSelections = () => {
//     setSelectedStudents([]);
//     console.log('Cleared selections');
//   };

//   const openChangeModal = (student: StudentResult) => {
//     setSelectedStudent(student);
//     setIsChangeModalOpen(true);
//   };

//   const handleChangeRoom = async () => {
//     if (!selectedStudent || !building || !room) {
//       toast.error('Please select a building and room.');
//       return;
//     }
//     const success = await updateStudentRoom(selectedStudent.id, room, building);
//     if (success) {
//       toast.success('Room updated successfully!');
//       setIsChangeModalOpen(false);
//       setBuilding('');
//       setRoom('');
//     } else {
//       toast.error(updateError || 'Failed to update room.');
//     }
//   };

//   const handleSwapClick = () => {
//     if (selectedStudents.length !== 2) {
//       toast.error('Please select exactly two students to swap.');
//       return;
//     }
//     console.log('Opening swap modal with students:', selectedStudents.map((s) => s.id));
//     onSwap(selectedStudents);
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex gap-2">
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           placeholder="Enter CET ID or name"
//           className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           disabled={loading}
//         />
//         <button
//           onClick={handleSearch}
//           disabled={loading}
//           className="px-4 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB] disabled:bg-gray-400"
//         >
//           {loading ? 'Searching...' : 'Search'}
//         </button>
//       </div>
//       {error && <p className="text-red-500">{error}</p>}
//       {results.length > 0 && (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white shadow-md rounded-md">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="p-2 text-left">Select</th>
//                 <th className="p-2 text-left">Name</th>
//                 <th className="p-2 text-left">CET ID</th>
//                 <th className="p-2 text-left">Course</th>
//                 <th className="p-2 text-left">Gender</th>
//                 <th className="p-2 text-left">Mobile</th>
//                 <th className="p-2 text-left">Room</th>
//                 <th className="p-2 text-left">Building</th>
//                 <th className="p-2 text-left">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {results.map((student) => (
//                 <tr key={student.id} className="border-t">
//                   <td className="p-2">
//                     <input
//                       type="checkbox"
//                       checked={selectedStudents.some((s) => s.id === student.id)}
//                       onChange={() => handleSelectStudent(student)}
//                     />
//                   </td>
//                   <td className="p-2">{student.name}</td>
//                   <td className="p-2">{student.cet_application_id}</td>
//                   <td className="p-2">{student.course}</td>
//                   <td className="p-2">{student.gender}</td>
//                   <td className="p-2">{student.mobile_number}</td>
//                   <td className="p-2">{student.room_number || '-'}</td>
//                   <td className="p-2">{student.building_name || '-'}</td>
//                   <td className="p-2">
//                     <button
//                       onClick={() => openChangeModal(student)}
//                       className="px-2 py-1 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB]"
//                     >
//                       Change Room
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <div className="mt-4 flex gap-2">
//             <button
//               onClick={handleSwapClick}
//               className="px-4 py-2 bg-[#10B981] text-white rounded-md hover:bg-[#0D9F72] disabled:bg-gray-400"
//               disabled={selectedStudents.length !== 2}
//             >
//               Swap Rooms
//             </button>
//             <button
//               onClick={handleClearSelections}
//               className="px-4 py-2 bg-[#6B7280] text-white rounded-md hover:bg-[#4B5563]"
//               disabled={selectedStudents.length === 0}
//             >
//               Clear Selections
//             </button>
//           </div>
//         </div>
//       )}
//       <Modal
//         isOpen={isChangeModalOpen}
//         onRequestClose={() => setIsChangeModalOpen(false)}
//         className="max-w-md mx-auto mt-20 p-6 bg-white rounded-md shadow-lg"
//         overlayClassName="fixed inset-0 bg-black bg-opacity-50"
//       >
//         <h2 className="text-xl font-bold mb-4">Room Allocation</h2>
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium">Building</label>
//             <Select
//               options={buildings.map((b) => ({ value: b, label: b }))}
//               onChange={(opt) => {
//                 setBuilding(opt?.value || '');
//                 setRoom('');
//               }}
//               placeholder="Select Building"
//               className="mt-1"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium">Room</label>
//             <Select
//               options={rooms.map((r) => ({ value: r.room_number, label: `${r.room_number} (Vacant: ${r.vacant})` }))}
//               onChange={(opt) => setRoom(opt?.value || '')}
//               placeholder="Select Room"
//               className="mt-1"
//               isDisabled={!building}
//             />
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={handleChangeRoom}
//               disabled={updateLoading || !building || !room}
//               className="flex-1 px-4 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB] disabled:bg-gray-400"
//             >
//               {updateLoading ? 'Saving...' : 'Save'}
//             </button>
//             <button
//               onClick={() => setIsChangeModalOpen(false)}
//               className="flex-1 py-2 bg-[#6B7280] text-white rounded-md hover:bg-[#4B5563]"
//             >
//               Cancel
//             </button>
//           </div>
//           {updateError && <p className="text-red-500">{updateError}</p>}
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export { SearchComponent };




'use client';

import { useState, useEffect } from 'react';
import useStudentSearch from '../hooks/useStudentSearch';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import Modal from 'react-modal';
import { StudentResult } from '../types';

// Set app element dynamically on client side
if (typeof window !== 'undefined') {
  const appElement = document.getElementById('__next') || document.body;
  Modal.setAppElement(appElement);
}

const SearchComponent = ({ onSwap }: { onSwap: (students: StudentResult[]) => void }) => {
  const {
    results,
    error,
    loading,
    searchStudents,
    updateStudentRoom,
    updateError,
    updateLoading,
    buildings,
    rooms,
    fetchBuildings,
    fetchRooms,
  } = useStudentSearch();
  const [searchTerm, setSearchTerm] = useState('');
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<StudentResult[]>([]);

  useEffect(() => {
    fetchBuildings();
  }, [ fetchBuildings ]);

  useEffect(() => {
    if (building) {
      fetchRooms(building);
    } else {
      setRoom('');
    }
  }, [ fetchRooms, building ]);

  const handleSearch = async () => {
    console.log('Searching with term:', searchTerm);
    await searchStudents(searchTerm);
    if (error) {
      toast.error(error);
    }
  };

  const handleSelectStudent = (student: StudentResult) => {
    setSelectedStudents((prev) => {
      console.log('Selecting student:', student.id, 'Current selections:', prev.map((s) => s.id));
      if (prev.find((s) => s.id === student.id)) {
        return prev.filter((s) => s.id !== student.id);
      }
      if (prev.length >= 2) {
        toast.error('You can select only two students for swapping.');
        return prev;
      }
      if (prev.some((s) => s.id === student.id)) {
        toast.error('Student already selected.');
        return prev;
      }
      return [...prev, student];
    });
  };

  const handleClearSelections = () => {
    setSelectedStudents([]);
    console.log('Cleared selections');
  };

  const openChangeModal = (student: StudentResult) => {
    setSelectedStudent(student);
    setIsChangeModalOpen(true);
  };

  const handleChangeRoom = async () => {
    if (!selectedStudent || !building || !room) {
      toast.error('Please select a building and room.');
      return;
    }
    const success = await updateStudentRoom(selectedStudent.id, room, building);
    if (success) {
      toast.success('Room updated successfully!');
      setIsChangeModalOpen(false);
      setBuilding('');
      setRoom('');
    } else {
      toast.error(updateError || 'Failed to update room.');
    }
  };

  const handleSwapClick = () => {
    if (selectedStudents.length !== 2) {
      toast.error('Please select exactly two students to swap.');
      return;
    }
    console.log('Opening swap modal with students:', selectedStudents.map((s) => s.id));
    onSwap(selectedStudents);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter CET ID or name"
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701] disabled:bg-gray-400"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {results.length > 0 && (
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
                      onChange={() => handleSelectStudent(student)}
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
                      onClick={() => openChangeModal(student)}
                      className="px-2 py-1 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701]"
                    >
                      Change Room
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSwapClick}
              className="px-4 py-2 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701] disabled:bg-gray-400"
              disabled={selectedStudents.length !== 2}
            >
              Swap Rooms
            </button>
            <button
              onClick={handleClearSelections}
              className="px-4 py-2 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701]"
              disabled={selectedStudents.length === 0}
            >
              Clear Selections
            </button>
          </div>
        </div>
      )}
      <Modal
        isOpen={isChangeModalOpen}
        onRequestClose={() => setIsChangeModalOpen(false)}
        className="max-w-md mx-auto mt-20 p-6 bg-white rounded-md shadow-lg"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <h2 className="text-xl font-bold mb-4">Room Allocation</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Building</label>
            <Select
              options={buildings.map((b) => ({ value: b, label: b }))}
              onChange={(opt) => {
                setBuilding(opt?.value || '');
                setRoom('');
              }}
              placeholder="Select Building"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Room</label>
            <Select
              options={rooms.map((r) => ({ value: r.room_number, label: `${r.room_number} (Vacant: ${r.vacant})` }))}
              onChange={(opt) => setRoom(opt?.value || '')}
              placeholder="Select Room"
              className="mt-1"
              isDisabled={!building}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleChangeRoom}
              disabled={updateLoading || !building || !room}
              className="flex-1 px-4 py-2 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701] disabled:bg-gray-400"
            >
              {updateLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setIsChangeModalOpen(false)}
              className="flex-1 py-2 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701]"
            >
              Cancel
            </button>
          </div>
          {updateError && <p className="text-red-500">{updateError}</p>}
        </div>
      </Modal>
    </div>
  );
};

export { SearchComponent };