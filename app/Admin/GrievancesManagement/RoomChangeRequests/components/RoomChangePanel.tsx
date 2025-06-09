// components/RoomChangePanel.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Student, Room } from '../types';
import StudentInfoCard from './StudentInfoCard';

interface RoomChangePanelProps {
  selectedStudent: Student | null;
  onFetchRooms: (studentType?: string) => Promise<Room[]>;
  onChangeRoom: (studentId: string, buildingName: string, roomNumber: string) => Promise<boolean>;
  loading: boolean;
}

const RoomChangePanel: React.FC<RoomChangePanelProps> = ({
  selectedStudent,
  onFetchRooms,
  onChangeRoom,
  loading
}) => {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const fetchRooms = useCallback(async () => {
    const rooms = await onFetchRooms();
    setAvailableRooms(rooms);
  }, [onFetchRooms]);

  useEffect(() => {
    if (selectedStudent) {
      fetchRooms();
    } else {
      setAvailableRooms([]);
      setSelectedRoom(null);
    }
  }, [fetchRooms, selectedStudent]);


  const handleRoomChange = async () => {
    if (!selectedStudent || !selectedRoom) return;

    const success = await onChangeRoom(
      selectedStudent.id,
      selectedRoom.building_name,
      selectedRoom.room_number
    );

    if (success) {
      setSelectedRoom(null);
      fetchRooms();
    }
  };

  if (!selectedStudent) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Search and select a student to change their room assignment</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Student Display */}
      <StudentInfoCard
        student={selectedStudent}
        variant="selected"
        title="Selected Student"
      />

      {/* Available Rooms */}
      {availableRooms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Rooms</h3>
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {availableRooms.map((room) => (
              <div
                key={`${room.building_name}-${room.room_number}`}
                onClick={() => setSelectedRoom(room)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRoom === room 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className="flex justify-between items-center">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Building</p>
                      <p className="font-medium">{room.building_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Room</p>
                      <p className="font-medium">{room.room_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Floor</p>
                      <p className="font-medium">{room.floor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">{room.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Occupancy</p>
                      <p className="font-medium">{room.occupants}/{room.capacity}</p>
                    </div>
                  </div>
                  <div className="text-green-600 font-medium">
                    {room.vacant} vacant
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Confirm Change Button */}
          {selectedRoom && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">
                    Change {selectedStudent.name}&apos;s room to:
                  </p>
                  <p className="text-gray-600">
                    {selectedRoom.building_name} - Room {selectedRoom.room_number}
                  </p>
                </div>
                <button
                  onClick={handleRoomChange}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                  {loading ? 'Changing Room...' : 'Confirm Room Change'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {availableRooms.length === 0 && selectedStudent && (
        <div className="text-center py-8 text-gray-500">
          <p>No available rooms found</p>
        </div>
      )}
    </div>
  );
};

export default RoomChangePanel;