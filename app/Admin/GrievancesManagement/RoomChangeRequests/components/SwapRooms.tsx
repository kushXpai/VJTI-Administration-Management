
'use client';

import { useState } from 'react';
import { useStudentSearch } from '../hooks/useStudentSearch';
import Modal from 'react-modal';
import { toast } from 'react-hot-toast';
import { StudentResult } from '../types';

// Set app element dynamically on client side
if (typeof window !== 'undefined') {
  const appElement = document.getElementById('__next') || document.body;
  Modal.setAppElement(appElement);
}

const SwapRooms = ({
  isOpen,
  onClose,
  student1,
  student2,
}: {
  isOpen: boolean;
  onClose: () => void;
  student1: StudentResult;
  student2: StudentResult;
}) => {
  const { swapStudentRooms, swapLoading, swapError } = useStudentSearch();
  const [confirming, setConfirming] = useState(false);

  const handleSwap = async () => {
    setConfirming(true);
    console.log('Initiating swap:', { student1Id: student1.id, student2Id: student2.id });
    const success = await swapStudentRooms(student1.id, student2.id);
    setConfirming(false);
    if (success) {
      toast.success('Rooms swapped successfully!');
      onClose();
    } else {
      toast.error(swapError || 'Failed to swap rooms.');
      console.error('Swap failed:', swapError);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-md mx-auto mt-20 p-6 bg-white rounded-md shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <h2 className="text-xl font-bold mb-4">Confirm Room Swap</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Student 1</h3>
          <div className="mt-2 p-2 bg-gray-100 rounded-md">
            <p><strong>Name:</strong> {student1.name}</p>
            <p><strong>CET ID:</strong> {student1.cet_application_id}</p>
            <p><strong>Room:</strong> {student1.room_number || '-'}</p>
            <p><strong>Building:</strong> {student1.building_name || '-'}</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Student 2</h3>
          <div className="mt-2 p-2 bg-gray-100 rounded-md">
            <p><strong>Name:</strong> {student2.name}</p>
            <p><strong>CET ID:</strong> {student2.cet_application_id}</p>
            <p><strong>Room:</strong> {student2.room_number || '-'}</p>
            <p><strong>Building:</strong> {student2.building_name || '-'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSwap}
            disabled={swapLoading || confirming}
            className="flex-1 px-4 py-2 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701] disabled:bg-gray-400"
          >
            {swapLoading || confirming ? 'Swapping...' : 'Confirm Swap'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701]"
          >
            Cancel
          </button>
        </div>
        {swapError && <p className="text-red-500">{swapError}</p>}
      </div>
    </Modal>
  );
};

export { SwapRooms };