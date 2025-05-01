// app/Admin/HostelManagement/RoomAllotment/Components/ManualAllocationModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { HostelApplication, Room, HostelBlock } from '../Types/Type';
import { useNotification } from '../Contexts/NotificationContext';

interface ManualAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: HostelApplication | null;
  rooms: Room[];
  setApplications: React.Dispatch<React.SetStateAction<HostelApplication[]>>;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

export default function ManualAllocationModal({
  isOpen,
  onClose,
  application,
  rooms,
  setApplications,
  setRooms,
}: ManualAllocationModalProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<HostelBlock | ''>('');
  const [selectedFloor, setSelectedFloor] = useState<number | ''>('');
  const [selectedRoom, setSelectedRoom] = useState<number | ''>('');
  const [availableFloors, setAvailableFloors] = useState<number[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const { showNotification } = useNotification();

  const genderToRoomType = (gender: string): string => {
    return gender === 'Male' ? 'Boys' : 'Girls';
  };

  const allowedBuildings: Record<string, HostelBlock[]> = {
    Boys: ['PG Block', 'C Block', 'D Block'],
    Girls: ['B Block'],
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedBuilding('');
      setSelectedFloor('');
      setSelectedRoom('');
      setAvailableFloors([]);
      setAvailableRooms([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedBuilding && application) {
      const roomType = genderToRoomType(application.gender);
      const floors = Array.from(
        new Set(
          rooms
            .filter(
              (room) =>
                room.building_name === selectedBuilding &&
                room.type === roomType &&
                allowedBuildings[roomType].includes(room.building_name)
            )
            .map((room) => room.floor)
        )
      ).sort((a, b) => a - b);
      setAvailableFloors(floors);
      setSelectedFloor(floors.length > 0 ? floors[0] : '');
      setSelectedRoom('');
    } else {
      setAvailableFloors([]);
      setSelectedFloor('');
      setSelectedRoom('');
    }
  }, [selectedBuilding, rooms, application]);

  useEffect(() => {
    if (selectedBuilding && selectedFloor !== '' && application) {
      const roomType = genderToRoomType(application.gender);
      const filteredRooms = rooms
        .filter(
          (room) =>
            room.building_name === selectedBuilding &&
            room.floor === selectedFloor &&
            room.type === roomType &&
            room.vacant > 0 &&
            allowedBuildings[roomType].includes(room.building_name)
        )
        .sort((a, b) => a.room_number.localeCompare(b.room_number));
      setAvailableRooms(filteredRooms);
      setSelectedRoom(filteredRooms.length > 0 ? filteredRooms[0].id : '');
    } else {
      setAvailableRooms([]);
      setSelectedRoom('');
    }
  }, [selectedBuilding, selectedFloor, rooms, application]);

  const handleAllocate = async () => {
    if (!application || !selectedBuilding || selectedFloor === '' || selectedRoom === '') {
      showNotification('Please select building, floor, and room.', 'error');
      return;
    }

    const roomType = genderToRoomType(application.gender);
    const room = rooms.find((r) => r.id === selectedRoom);

    if (!room) {
      showNotification('Selected room not found.', 'error');
      onClose();
      return;
    }

    if (room.type !== roomType || !allowedBuildings[roomType].includes(room.building_name)) {
      showNotification('Gender mismatch: Cannot allocate to this room.', 'error');
      onClose();
      return;
    }

    const updatedOccupantsList = [...room.occupants_list, String(application.id)];
    const { error: roomError } = await supabase
      .from('rooms')
      .update({
        vacant: room.vacant - 1,
        occupants: room.occupants + 1,
        occupants_list: updatedOccupantsList,
      })
      .eq('id', room.id);

    if (roomError) {
      showNotification(`Error updating room: ${roomError.message}`, 'error');
      onClose();
      return;
    }

    const { error: appError } = await supabase
      .from('hostel_applications')
      .update({
        hostel_allotment_status: 'Accepted',
        building_name: selectedBuilding,
        room_number: room.room_number,
      })
      .eq('id', application.id);

    if (appError) {
      showNotification(`Error updating application: ${appError.message}`, 'error');
      onClose();
      return;
    }

    setApplications((prev) =>
      prev.map((app) =>
        app.id === application.id
          ? {
              ...app,
              hostel_allotment_status: 'Accepted',
              hostel_block: selectedBuilding,
              room_number: room.room_number,
            }
          : app
      )
    );

    setRooms((prev) =>
      prev.map((r) =>
        r.id === room.id
          ? {
              ...r,
              vacant: r.vacant - 1,
              occupants: r.occupants + 1,
              occupants_list: updatedOccupantsList,
            }
          : r
      )
    );

    showNotification(
      `Allocated ${application.name} to ${selectedBuilding}, Room ${room.room_number}`,
      'success'
    );
    onClose();
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Transparent Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Card-style Modal */}
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-50">
        <h2 className="text-xl font-bold text-[#800000] mb-4">
          Allocate Room for {application.name}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Building</label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value as HostelBlock)}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">Select Building</option>
              <option value="PG Block">PG Block</option>
              <option value="C Block">C Block</option>
              <option value="D Block">D Block</option>
              <option value="B Block">B Block</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Floor</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(Number(e.target.value))}
              className="w-full border px-2 py-1 rounded"
              disabled={!selectedBuilding}
            >
              <option value="">Select Floor</option>
              {availableFloors.map((floor) => (
                <option key={floor} value={floor}>
                  Floor {floor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Room</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(Number(e.target.value))}
              className="w-full border px-2 py-1 rounded"
              disabled={!selectedFloor}
            >
              <option value="">Select Room</option>
              {availableRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  Room {room.room_number} (Available: {room.vacant})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
            onClick={handleAllocate}
          >
            Allocate
          </button>
        </div>
      </div>
    </div>
  );
}