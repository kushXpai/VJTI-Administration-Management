import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { supabase } from '@/supabase/supabaseClient';
import { toast } from 'react-hot-toast';
import { useChangeRoom } from '../hooks/useChangeRoom';

interface ChangeRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    name: string;
    hostel_id?: string;
    room_id?: string;
  };
}

const ChangeRoomModal = ({ isOpen, onClose, student }: ChangeRoomModalProps) => {
  const [hostels, setHostels] = useState<{ hostel_id: string; name: string }[]>([]);
  const [rooms, setRooms] = useState<{ room_id: string; number: string }[]>([]);
  const [selectedHostel, setSelectedHostel] = useState(student.hostel_id || '');
  const [selectedRoom, setSelectedRoom] = useState(student.room_id || '');

  const { changeRoom, loading, error } = useChangeRoom();

  useEffect(() => {
    if (isOpen) {
      setSelectedHostel(student.hostel_id || '');
      setSelectedRoom(student.room_id || '');
    }
  }, [isOpen, student]);

  useEffect(() => {
    const fetchHostels = async () => {
      const { data } = await supabase.from('hostel_db').select('hostel_id, name');
      if (data) setHostels(data);
    };
    fetchHostels();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!selectedHostel) return setRooms([]);
      const { data } = await supabase.from('room_db').select('room_id, number').eq('hostel_id', selectedHostel);
      if (data) setRooms(data);
    };
    fetchRooms();
  }, [selectedHostel]);

  const handleRoomChange = async () => {
    if (!selectedRoom) return toast.error('Please select a room');
    const success = await changeRoom(student.id, selectedRoom, selectedHostel);
    success ? (toast.success('Room changed successfully'), onClose()) : toast.error(error || 'Failed to change room');
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-md mx-auto mt-20 p-6 bg-white rounded-md shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <h2 className="text-xl font-bold mb-4 text-[#800000]">Change Room for {student.name}</h2>
      <div className="mb-4 text-gray-700">
        <p className="text-sm mb-1">Current Hostel: {student.hostel_id || 'N/A'}</p>
        <p className="text-sm mb-3">Current Room: {student.room_id || 'N/A'}</p>
      </div>

      <label className="block mb-1 font-semibold text-[#800000]">Select Hostel (optional)</label>
      <select
        value={selectedHostel}
        onChange={(e) => setSelectedHostel(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-[#800000]"
      >
        <option value="">-- Keep Same Hostel --</option>
        {hostels.map(h => (
          <option key={h.hostel_id} value={h.hostel_id}>{h.name}</option>
        ))}
      </select>

      <label className="block mb-1 font-semibold text-[#800000]">Select Room</label>
      <select
        value={selectedRoom}
        onChange={(e) => setSelectedRoom(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-[#800000]"
      >
        <option value="">-- Select Room --</option>
        {rooms.map(r => (
          <option key={r.room_id} value={r.room_id}>Room {r.number}</option>
        ))}
      </select>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleRoomChange}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#5E0701] disabled:bg-gray-400"
        >
          {loading ? 'Changing...' : 'Confirm Change'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#5E0701]"
        >
          Cancel
        </button>
      </div>

      {error && <p className="text-red-600 mt-3">{error}</p>}
    </Modal>
  );
};

export default ChangeRoomModal;
