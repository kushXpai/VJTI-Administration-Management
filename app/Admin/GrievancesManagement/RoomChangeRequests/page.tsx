'use client';

import { useState } from 'react';
import { SearchComponent } from './components/SearchComponent';
import { SwapRooms } from './components/SwapRooms';
import ChangeRoomModal from './components/ChangeRoomModal';
import { Toaster } from 'react-hot-toast';
import { StudentResult } from './types';
import Header from '@/app/Components/Header';
import Footer from '@/app/Components/Footer';

const RoomChangePage = () => {
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<StudentResult[]>([]);
  const [selectedStudentForChange, setSelectedStudentForChange] = useState<StudentResult | null>(null);

  const handleSwap = (students: StudentResult[]) => {
    if (students.length === 2) {
      setSelectedStudents(students);
      setIsSwapModalOpen(true);
    }
  };

  const handleOpenChangeRoom = (student: StudentResult) => {
    setSelectedStudentForChange(student);
    setIsChangeModalOpen(true);
  };

  const handleCloseSwap = () => {
    setIsSwapModalOpen(false);
    setSelectedStudents([]);
  };

  const handleCloseChangeRoom = () => {
    setIsChangeModalOpen(false);
    setSelectedStudentForChange(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-[#800000]">Room Change Requests</h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <SearchComponent onSwap={handleSwap} onChangeRoom={handleOpenChangeRoom} />
          </div>

          {selectedStudents.length === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <SwapRooms
                isOpen={isSwapModalOpen}
                onClose={handleCloseSwap}
                student1={selectedStudents[0]}
                student2={selectedStudents[1]}
              />
            </div>
          )}

          {selectedStudentForChange && (
            <ChangeRoomModal
              isOpen={isChangeModalOpen}
              onClose={handleCloseChangeRoom}
              student={{
                ...selectedStudentForChange,
                hostel_id: selectedStudentForChange?.hostel_id ?? undefined,
                room_id: selectedStudentForChange?.room_id ?? undefined,
              }}
            />
          )}
        </div>

        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        }} />
      </main>
      <Footer />
    </div>
  );
};

export default RoomChangePage;
