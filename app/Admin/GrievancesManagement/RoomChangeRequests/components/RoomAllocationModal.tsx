'use client';

import { toast } from 'react-hot-toast';
import Modal from 'react-modal';
import Select from 'react-select';
import { StudentResult } from '../types';

interface RoomAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudent: StudentResult | null;
  buildings: string[];
  rooms: { room_number: string; vacant: number }[];
  building: string;
  setBuilding: (building: string) => void;
  room: string;
  setRoom: (room: string) => void;
  updateStudentRoom: (studentId: string, room: string, building: string) => Promise<boolean>;
  updateError: string | null;
  updateLoading: boolean;
}

const RoomAllocationModal = ({
  isOpen,
  onClose,
  selectedStudent,
  buildings,
  rooms,
  building,
  setBuilding,
  room,
  setRoom,
  updateStudentRoom,
  updateError,
  updateLoading,
}: RoomAllocationModalProps) => {
  const handleChangeRoom = async () => {
    if (!selectedStudent || !building || !room) {
      toast.error('Please select a building and room.');
      return;
    }
    const success = await updateStudentRoom(selectedStudent.id, room, building);
    if (success) {
      toast.success('Room updated successfully!');
      onClose();
    } else {
      toast.error(updateError || 'Failed to update room.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
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
            onClick={onClose}
            className="flex-1 py-2 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701]"
          >
            Cancel
          </button>
        </div>
        {updateError && <p className="text-red-500">{updateError}</p>}
      </div>
    </Modal>
  );
};

export { RoomAllocationModal };