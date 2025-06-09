'use client';

import { useState } from 'react';
import { SearchComponent } from './components/SearchComponent';
import { SwapRooms } from './components/SwapRooms';
import { Toaster } from 'react-hot-toast';
import { StudentResult } from './types';
import Header from '@/app/Components/Header';
import Footer from '@/app/Components/Footer';

const RoomChangePage = () => {
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<StudentResult[]>([]);

  const handleSwap = (students: StudentResult[]) => {
    if (students.length === 2) {
      console.log('HandleSwap:', students.map((s) => s.id));
      setSelectedStudents(students);
      setIsSwapModalOpen(true);
    }
  };

  const handleCloseSwap = () => {
    console.log('Closing swap modal, clearing selections');
    setIsSwapModalOpen(false);
    setSelectedStudents([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">Room Change Requests</h1>
    
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <SearchComponent onSwap={handleSwap} />
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
}

export default RoomChangePage;