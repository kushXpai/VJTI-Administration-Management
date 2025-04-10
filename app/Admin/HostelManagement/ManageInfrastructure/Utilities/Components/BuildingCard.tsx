// app/Admin/HostelManagement/ManageInfrastructure/Utilities/Components/BuildingCard.tsx
import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Building } from '../../page';
import FloorSection from './FloorSection';

interface BuildingCardProps {
  building: Building;
  isExpanded: boolean;
  onToggle: () => void;
  supabase: SupabaseClient;
  onUpdate: () => void;
  setMessage: (message: { text: string; type: 'success' | 'error' | '' }) => void;
}

interface FloorDetails {
  floor: number;
  rooms: {
    id: number;
    room_number: string;
    capacity: number;
    vacant: number;
    occupants: number;
  }[];
}

export default function BuildingCard({ 
  building, 
  isExpanded, 
  onToggle, 
  supabase,
  onUpdate,
  setMessage
}: BuildingCardProps) {
  const [floorDetails, setFloorDetails] = useState<FloorDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showAddFloorForm, setShowAddFloorForm] = useState<boolean>(false);
  const [newFloor, setNewFloor] = useState({
    floorNumber: 0,
    roomCount: 10,
    startingRoomNumber: 1
  });

  // Fetch floor details when building is expanded
  useEffect(() => {
    if (isExpanded) {
      const fetchFloorDetails = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('building_name', building.name)
            .order('floor', { ascending: true })
            .order('room_number', { ascending: true });
  
          if (error) throw error;
  
          const groupedByFloor = data.reduce((acc: FloorDetails[], room) => {
            const existing = acc.find(f => f.floor === room.floor);
            if (existing) {
              existing.rooms.push(room);
            } else {
              acc.push({ floor: room.floor, rooms: [room] });
            }
            return acc;
          }, []);
  
          setFloorDetails(groupedByFloor);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to fetch floor details.';
          setMessage({ text: message, type: 'error' });
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchFloorDetails();
    }
  }, [isExpanded, building.name, supabase, setMessage]);
  

  const fetchFloorDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('building_name', building.name)
        .order('floor', { ascending: true })
        .order('room_number', { ascending: true });
      
      if (error) throw error;
      
      // Group rooms by floor
      const floorMap = new Map<number, FloorDetails>();
      
      data.forEach(room => {
        if (!floorMap.has(room.floor)) {
          floorMap.set(room.floor, {
            floor: room.floor,
            rooms: []
          });
        }
        
        floorMap.get(room.floor)!.rooms.push({
          id: room.id,
          room_number: room.room_number,
          capacity: room.capacity,
          vacant: room.vacant,
          occupants: room.occupants
        });
      });
      
      setFloorDetails(Array.from(floorMap.values()).sort((a, b) => a.floor - b.floor));

      // Find next available floor number for new floor form
      if (floorMap.size > 0) {
        const maxFloor = Math.max(...Array.from(floorMap.keys()));
        setNewFloor(prev => ({ ...prev, floorNumber: maxFloor + 1 }));
      } else {
        setNewFloor(prev => ({ ...prev, floorNumber: 1 }));
      }
    } catch (error) {
      console.error('Error fetching floor details:', error);
      setMessage({ 
        text: `Error loading floor details: ${(error as Error).message}`, 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBuilding = async () => {
    if (!confirm(`Are you sure you want to delete ${building.name} and all its rooms?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('building_name', building.name);
      
      if (error) throw error;
      
      setMessage({ 
        text: `Successfully deleted ${building.name}`, 
        type: 'success' 
      });
      onUpdate();
    } catch (error) {
      console.error('Error deleting building:', error);
      setMessage({ 
        text: `Error deleting building: ${(error as Error).message}`, 
        type: 'error' 
      });
    }
  };

  const handleAddFloor = async () => {
    try {
      // Generate room numbers
      const roomsToInsert = Array.from({ length: newFloor.roomCount }, (_, i) => {
        const roomNumber = newFloor.startingRoomNumber + i;
        return {
          building_name: building.name,
          type: building.type,
          floor: newFloor.floorNumber,
          room_number: `${building.prefix}${newFloor.floorNumber}${String(roomNumber).padStart(2, '0')}`,
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
        text: `Successfully added floor ${newFloor.floorNumber} to ${building.name}`, 
        type: 'success' 
      });
      setShowAddFloorForm(false);
      fetchFloorDetails();
      onUpdate();
    } catch (error) {
      console.error('Error adding floor:', error);
      setMessage({ 
        text: `Error adding floor: ${(error as Error).message}`, 
        type: 'error' 
      });
    }
  };

  const handleDeleteFloor = async (floorNumber: number) => {
    if (!confirm(`Are you sure you want to delete floor ${floorNumber} and all its rooms from ${building.name}?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('building_name', building.name)
        .eq('floor', floorNumber);
      
      if (error) throw error;
      
      setMessage({ 
        text: `Successfully deleted floor ${floorNumber} from ${building.name}`, 
        type: 'success' 
      });
      fetchFloorDetails();
      onUpdate();
    } catch (error) {
      console.error('Error deleting floor:', error);
      setMessage({ 
        text: `Error deleting floor: ${(error as Error).message}`, 
        type: 'error' 
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Building Header */}
      <div 
        className={`flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 ${isExpanded ? 'border-b border-gray-100' : ''}`}
        onClick={onToggle}
      >
        <div>
          <h3 className="font-bold text-lg">{building.name}</h3>
          <p className="text-sm text-gray-600">
            {building.type} • {building.roomCount} rooms • {building.floors.length} floors
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!isExpanded && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                onToggle();
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteBuilding();
            }}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
          <svg 
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Expanded Building Details */}
      {isExpanded && (
        <div className="p-4">
          {isLoading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#800000]"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-[#800000]">Floors & Rooms</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {isEditing ? 'Done Editing' : 'Edit Rooms'}
                  </button>
                  <button
                    onClick={() => setShowAddFloorForm(!showAddFloorForm)}
                    className="px-3 py-1 text-sm bg-[#800000] text-white rounded hover:bg-[#600000]"
                  >
                    {showAddFloorForm ? 'Cancel' : 'Add Floor'}
                  </button>
                </div>
              </div>
              
              {/* Add Floor Form */}
              {showAddFloorForm && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
                  <h5 className="font-medium mb-2">Add New Floor</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Floor Number
                      </label>
                      <input
                        type="number"
                        value={newFloor.floorNumber}
                        onChange={(e) => setNewFloor(prev => ({ ...prev, floorNumber: parseInt(e.target.value) || 0 }))}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Rooms
                      </label>
                      <input
                        type="number"
                        value={newFloor.roomCount}
                        onChange={(e) => setNewFloor(prev => ({ ...prev, roomCount: parseInt(e.target.value) || 0 }))}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Room Number
                      </label>
                      <input
                        type="number"
                        value={newFloor.startingRoomNumber}
                        onChange={(e) => setNewFloor(prev => ({ ...prev, startingRoomNumber: parseInt(e.target.value) || 1 }))}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleAddFloor}
                      className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#600000]"
                    >
                      Add Floor
                    </button>
                  </div>
                </div>
              )}
              
              {/* Floor Sections */}
              <div className="space-y-4">
                {floorDetails.map((floor) => (
                  <FloorSection
                    key={floor.floor}
                    floor={floor}
                    isEditing={isEditing}
                    supabase={supabase}
                    buildingName={building.name}
                    onUpdate={fetchFloorDetails}
                    setMessage={setMessage}
                    onDeleteFloor={() => handleDeleteFloor(floor.floor)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}