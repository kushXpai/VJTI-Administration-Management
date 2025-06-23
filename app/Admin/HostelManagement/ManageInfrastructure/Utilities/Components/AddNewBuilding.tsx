// app/Admin/HostelManagement/ManageInfrastructure/Utilities/Components/AddNewBuilding.tsx

import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

interface Floor {
  floorNumber: number;
  roomCount: number;
  startingRoomNumber: number;
}

interface Mess {
  mess_id: string;
  name: string;
  mess_fees: number;
}

interface FormData {
  buildingName: string;
  buildingType: "Girls" | "Boys";
  buildingPrefix: string;
  hostelFees: number;
  messId: string;
  floors: Floor[];
}

interface AddNewBuildingProps {
  supabase: SupabaseClient;
  onSuccess: () => void;
}

// Helper function to generate UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function AddNewBuilding({ supabase, onSuccess }: AddNewBuildingProps) {
  const [formData, setFormData] = useState<FormData>({
    buildingName: '',
    buildingType: "Girls",
    buildingPrefix: '',
    hostelFees: 0,
    messId: '',
    floors: [{ floorNumber: 1, roomCount: 30, startingRoomNumber: 1 }]
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [messes, setMesses] = useState<Mess[]>([]);
  const [isLoadingMesses, setIsLoadingMesses] = useState<boolean>(true);

  // Fetch available messes on component mount
  useEffect(() => {
    const fetchMesses = async () => {
      try {
        setIsLoadingMesses(true);
        const { data, error } = await supabase
          .from('mess_db')
          .select('mess_id, name, mess_fees')
          .order('name');
        
        if (error) {
          console.error('Error fetching messes:', error);
          setFormError('Failed to load mess options');
        } else {
          setMesses(data || []);
        }
      } catch (error) {
        console.error('Error fetching messes:', error);
        setFormError('Failed to load mess options');
      } finally {
        setIsLoadingMesses(false);
      }
    };

    fetchMesses();
  }, [supabase]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'hostelFees' ? parseInt(value) || 0 : value 
    }));
  };

  // Handle floor room count changes
  const handleFloorChange = (index: number, field: keyof Floor, value: number) => {
    const updatedFloors = [...formData.floors];
    updatedFloors[index][field] = value;
    setFormData(prev => ({ ...prev, floors: updatedFloors }));
  };

  // Add a new floor
  const addFloor = () => {
    const lastFloor = formData.floors[formData.floors.length - 1];
    const newFloorNumber = lastFloor.floorNumber + 1;
    setFormData(prev => ({
      ...prev,
      floors: [...prev.floors, { 
        floorNumber: newFloorNumber, 
        roomCount: 30, 
        startingRoomNumber: 1 
      }]
    }));
  };

  // Remove a floor
  const removeFloor = (index: number) => {
    if (formData.floors.length > 1) {
      const updatedFloors = [...formData.floors];
      updatedFloors.splice(index, 1);
      setFormData(prev => ({ ...prev, floors: updatedFloors }));
    }
  };

  // Generate a room number
  const generateRoomNumber = (prefix: string, floor: number, roomNumber: number): string => {
    return `${prefix}${floor}${String(roomNumber).padStart(2, '0')}`;
  };

  // Get selected mess details
  const getSelectedMess = (): Mess | null => {
    return messes.find(mess => mess.mess_id === formData.messId) || null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      // Validate required fields
      if (!formData.buildingName) {
        throw new Error('Building name is required');
      }
      if (!formData.buildingPrefix) {
        throw new Error('Building prefix is required');
      }
      if (formData.hostelFees < 0) {
        throw new Error('Hostel fees must be 0 or greater');
      }
      if (!formData.messId) {
        throw new Error('Please select a mess');
      }

      // Calculate total floor count
      const floorCount = formData.floors.length;
      
      // Generate UUID for the hostel
      const hostelId = generateUUID();

      // First, insert the hostel record with explicit UUID
      const { data: hostelData, error: hostelError } = await supabase
        .from('hostel_db')
        .insert({
          hostel_id: hostelId, // Explicitly provide the UUID
          name: formData.buildingName,
          prefix: formData.buildingPrefix,
          type: formData.buildingType,
          floor_count: floorCount,
          hostel_fees: formData.hostelFees,
          mess_id: formData.messId // Insert the selected mess_id
        })
        .select('hostel_id')
        .single();
      
      if (hostelError) throw hostelError;

      // Create an array of all rooms to be inserted
      const roomsToInsert = formData.floors.flatMap(floor => {
        const rooms = [];
        for (let i = 0; i < floor.roomCount; i++) {
          const roomNumber = floor.startingRoomNumber + i;
          rooms.push({
            room_id: generateUUID(), // Generate UUID for each room
            hostel_id: hostelId,
            number: parseInt(generateRoomNumber(formData.buildingPrefix, floor.floorNumber, roomNumber).replace(/[^0-9]/g, '')),
            capacity: 1, // Default capacity set to 1 instead of 0 (since CHECK constraint requires capacity > 0)
            occupancy: 0,
            occupant_ids: [],
            floor: floor.floorNumber
          });
        }
        return rooms;
      });

      // Insert all rooms in a single batch
      const { error: roomsError } = await supabase
        .from('room_db')
        .insert(roomsToInsert);
      
      if (roomsError) {
        // If room insertion fails, delete the hostel record to maintain consistency
        await supabase
          .from('hostel_db')
          .delete()
          .eq('hostel_id', hostelId);
        throw roomsError;
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error adding building:', error);
      setFormError(`Error: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-[#800000]">Add New Building</h2>
      
      {formError && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800">
          {formError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Building Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label htmlFor="buildingName" className="block text-sm font-medium text-gray-700 mb-1">
              Building Name
            </label>
            <input
              type="text"
              id="buildingName"
              name="buildingName"
              value={formData.buildingName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
              required
            />
          </div>
          
          <div>
            <label htmlFor="buildingPrefix" className="block text-sm font-medium text-gray-700 mb-1">
              Building Prefix (e.g., A)
            </label>
            <input
              type="text"
              id="buildingPrefix"
              name="buildingPrefix"
              value={formData.buildingPrefix}
              onChange={handleInputChange}
              maxLength={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
              required
            />
          </div>
          
          <div>
            <label htmlFor="buildingType" className="block text-sm font-medium text-gray-700 mb-1">
              Building Type
            </label>
            <select
              id="buildingType"
              name="buildingType"
              value={formData.buildingType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
              required
            >
              <option value="Girls">Girls</option>
              <option value="Boys">Boys</option>
            </select>
          </div>

          <div>
            <label htmlFor="hostelFees" className="block text-sm font-medium text-gray-700 mb-1">
              Hostel Fees
            </label>
            <input
              type="number"
              id="hostelFees"
              name="hostelFees"
              value={formData.hostelFees}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
              required
            />
          </div>

          <div>
            <label htmlFor="messId" className="block text-sm font-medium text-gray-700 mb-1">
              Mess Selection
            </label>
            <select
              id="messId"
              name="messId"
              value={formData.messId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
              required
              disabled={isLoadingMesses}
            >
              <option value="">
                {isLoadingMesses ? 'Loading messes...' : 'Select a mess'}
              </option>
              {messes.map((mess) => (
                <option key={mess.mess_id} value={mess.mess_id}>
                  {mess.name} (₹{mess.mess_fees})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Floor Details */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-[#800000]">Floor Details</h3>
            <button 
              type="button" 
              onClick={addFloor}
              className="px-3 py-1 bg-[#800000] text-white rounded hover:bg-[#600000]"
            >
              Add Floor
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.floors.map((floor, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Floor {floor.floorNumber}</h4>
                  {formData.floors.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeFloor(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`roomCount-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Rooms
                    </label>
                    <input
                      type="number"
                      id={`roomCount-${index}`}
                      value={floor.roomCount}
                      onChange={(e) => handleFloorChange(index, 'roomCount', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`startingRoom-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Starting Room Number
                    </label>
                    <input
                      type="number"
                      id={`startingRoom-${index}`}
                      value={floor.startingRoomNumber}
                      onChange={(e) => handleFloorChange(index, 'startingRoomNumber', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-gray-600">
                  <p>Will create: {floor.roomCount > 0 && formData.buildingPrefix ? (
                    `${formData.buildingPrefix}${floor.floorNumber}${String(floor.startingRoomNumber).padStart(2, '0')} to ${formData.buildingPrefix}${floor.floorNumber}${String(floor.startingRoomNumber + floor.roomCount - 1).padStart(2, '0')}`
                  ) : 'None'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Summary */}
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <h3 className="text-lg font-medium mb-2 text-[#800000]">Summary</h3>
          <p className="text-sm">Building: <span className="font-medium">{formData.buildingName || '(Not specified)'}</span></p>
          <p className="text-sm">Type: <span className="font-medium">{formData.buildingType}</span></p>
          <p className="text-sm">Prefix: <span className="font-medium">{formData.buildingPrefix || '(Not specified)'}</span></p>
          <p className="text-sm">Hostel Fees: <span className="font-medium">₹{formData.hostelFees}</span></p>
          <p className="text-sm">Selected Mess: <span className="font-medium">{getSelectedMess()?.name || '(Not selected)'}</span></p>
          {getSelectedMess() && (
            <p className="text-sm">Mess Fees: <span className="font-medium">₹{getSelectedMess()?.mess_fees}</span></p>
          )}
          <p className="text-sm">Total Floors: <span className="font-medium">{formData.floors.length}</span></p>
          <p className="text-sm">Total Rooms: <span className="font-medium">{formData.floors.reduce((total, floor) => total + floor.roomCount, 0)}</span></p>
        </div>
        
        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isLoadingMesses}
            className={`px-6 py-2 bg-[#800000] text-white rounded hover:bg-[#600000] focus:outline-none focus:ring-2 focus:ring-[#800000] ${(isSubmitting || isLoadingMesses) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Creating...' : 'Create Building'}
          </button>
        </div>
      </form>
    </div>
  );
}