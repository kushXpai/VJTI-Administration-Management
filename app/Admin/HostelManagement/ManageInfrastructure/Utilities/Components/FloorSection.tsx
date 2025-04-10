// app/Admin/HostelManagement/ManageInfrastructure/Utilities/Components/FloorSection.tsx

import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

interface FloorProps {
  floor: {
    floor: number;
    rooms: {
      id: number;
      room_number: string;
      capacity: number;
      vacant: number;
      occupants: number;
    }[];
  };
  isEditing: boolean;
  supabase: SupabaseClient;
  buildingName: string;
  onUpdate: () => void;
  setMessage: (message: { text: string; type: 'success' | 'error' | '' }) => void;
  onDeleteFloor: () => void;
}

export default function FloorSection({
  floor,
  isEditing,
  supabase,
  buildingName,
  onUpdate,
  setMessage,
  onDeleteFloor
}: FloorProps) {
  const [newRoomCount, setNewRoomCount] = useState<number>(1);
  const [showAddRoomForm, setShowAddRoomForm] = useState<boolean>(false);
  const [isUpdatingCapacity, setIsUpdatingCapacity] = useState<boolean>(false);
  const [capacityUpdates, setCapacityUpdates] = useState<Record<number, number>>({});

  // Calculate the last room number to determine the next room number for adding rooms
  const getNextRoomNumber = (): number => {
    if (floor.rooms.length === 0) return 1;
    
    const lastRoomNumber = floor.rooms[floor.rooms.length - 1].room_number;
    const numericPart = parseInt(lastRoomNumber.replace(/[^0-9]/g, ''));
    return (numericPart % 100) + 1; // Take only the last two digits
  };

  const handleAddRooms = async () => {
    if (newRoomCount <= 0) {
      setMessage({
        text: 'Number of rooms must be greater than 0',
        type: 'error'
      });
      return;
    }

    try {
      // Get the prefix from an existing room
      const prefix = floor.rooms.length > 0 
        ? floor.rooms[0].room_number.charAt(0)
        : 'A'; // Default prefix if no rooms exist
      
      const nextRoomNumber = getNextRoomNumber();
      
      // Generate new rooms
      const roomsToInsert = Array.from({ length: newRoomCount }, (_, i) => {
        const roomNumber = nextRoomNumber + i;
        return {
          building_name: buildingName,
          type: floor.rooms.length > 0 ? 'Girls' : 'Girls', // Default to Girls if no rooms exist
          floor: floor.floor,
          room_number: `${prefix}${floor.floor}${String(roomNumber).padStart(2, '0')}`,
          capacity: 0,
          vacant: 0,
          occupants: 0,
          occupants_list: []
        };
      });

      const { error } = await supabase
        .from('rooms')
        .insert(roomsToInsert);
      
      if (error) throw error;
      
      setMessage({
        text: `Successfully added ${newRoomCount} room(s) to floor ${floor.floor}`,
        type: 'success'
      });
      
      setShowAddRoomForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding rooms:', error);
      setMessage({
        text: `Error adding rooms: ${(error as Error).message}`,
        type: 'error'
      });
    }
  };

  const handleDeleteRoom = async (roomId: number, roomNumber: string) => {
    if (!confirm(`Are you sure you want to delete room ${roomNumber}?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);
      
      if (error) throw error;
      
      setMessage({
        text: `Successfully deleted room ${roomNumber}`,
        type: 'success'
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error deleting room:', error);
      setMessage({
        text: `Error deleting room: ${(error as Error).message}`,
        type: 'error'
      });
    }
  };

  const handleCapacityChange = (roomId: number, capacity: number) => {
    setCapacityUpdates(prev => ({
      ...prev,
      [roomId]: capacity
    }));
  };

  const saveCapacityUpdates = async () => {
    setIsUpdatingCapacity(true);
    try {
      // Process updates one by one
      for (const [roomId, capacity] of Object.entries(capacityUpdates)) {
        const { error } = await supabase
          .from('rooms')
          .update({ capacity })
          .eq('id', parseInt(roomId));
        
        if (error) throw error;
      }
      
      setMessage({
        text: 'Room capacities updated successfully',
        type: 'success'
      });
      
      setCapacityUpdates({});
      onUpdate();
    } catch (error) {
      console.error('Error updating capacities:', error);
      setMessage({
        text: `Error updating capacities: ${(error as Error).message}`,
        type: 'error'
      });
    } finally {
      setIsUpdatingCapacity(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {/* Floor Header */}
      <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <h5 className="font-medium">Floor {floor.floor}</h5>
          <span className="ml-2 px-2 py-1 bg-gray-200 rounded-md text-xs">
            {floor.rooms.length} room{floor.rooms.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditing && (
            <>
              <button
                onClick={() => setShowAddRoomForm(!showAddRoomForm)}
                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                {showAddRoomForm ? 'Cancel' : 'Add Room'}
              </button>
              <button
                onClick={onDeleteFloor}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Floor
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Add Room Form */}
      {isEditing && showAddRoomForm && (
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-end space-x-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Number of Rooms to Add
              </label>
              <input
                type="number"
                value={newRoomCount}
                onChange={(e) => setNewRoomCount(parseInt(e.target.value) || 0)}
                min="1"
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#800000]"
              />
            </div>
            <button
              onClick={handleAddRooms}
              className="px-3 py-1 text-sm bg-[#800000] text-white rounded hover:bg-[#600000]"
            >
              Add
            </button>
          </div>
        </div>
      )}
      
      {/* Rooms Display (Always shown) */}
      <div className="p-3">
        {Object.keys(capacityUpdates).length > 0 && (
          <div className="flex justify-end mb-2">
            <button
              onClick={saveCapacityUpdates}
              disabled={isUpdatingCapacity}
              className={`px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 ${isUpdatingCapacity ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUpdatingCapacity ? 'Saving...' : 'Save Capacity Changes'}
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {floor.rooms.map((room) => (
            <div
              key={room.id}
              className="p-2 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{room.room_number}</span>
                {isEditing && (
                  <button
                    onClick={() => handleDeleteRoom(room.id, room.room_number)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-600">
                {isEditing ? (
                  <div>
                    <label className="block mb-1">Capacity:</label>
                    <input
                      type="number"
                      value={capacityUpdates[room.id] !== undefined ? capacityUpdates[room.id] : room.capacity}
                      onChange={(e) => handleCapacityChange(room.id, parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#800000]"
                    />
                  </div>
                ) : (
                  <>
                    <div>Capacity: {room.capacity}</div>
                    <div>Occupied: {room.occupants}/{room.capacity}</div>
                    <div>Vacant: {room.vacant}</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}