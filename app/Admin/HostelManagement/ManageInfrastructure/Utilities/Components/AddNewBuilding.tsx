// app/Admin/HostelManagement/ManageInfrastructure/Utilities/Components/AddNewBuilding.tsx

import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

interface Floor {
  floorNumber: number;
  roomCount: number;
  startingRoomNumber: number;
}

interface FormData {
  buildingName: string;
  buildingType: "Girls" | "Boys";
  buildingPrefix: string;
  floors: Floor[];
}

interface AddNewBuildingProps {
  supabase: SupabaseClient;
  onSuccess: () => void;
}

export default function AddNewBuilding({ supabase, onSuccess }: AddNewBuildingProps) {
  const [formData, setFormData] = useState<FormData>({
    buildingName: '',
    buildingType: "Girls",
    buildingPrefix: '',
    floors: [{ floorNumber: 1, roomCount: 10, startingRoomNumber: 1 }]
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        roomCount: 10, 
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      // Validate building prefix
      if (!formData.buildingPrefix) {
        throw new Error('Building prefix is required');
      }

      // Create an array of all rooms to be inserted
      const roomsToInsert = formData.floors.flatMap(floor => {
        const rooms = [];
        for (let i = 0; i < floor.roomCount; i++) {
          const roomNumber = floor.startingRoomNumber + i;
          rooms.push({
            building_name: formData.buildingName,
            type: formData.buildingType,
            floor: floor.floorNumber,
            room_number: generateRoomNumber(formData.buildingPrefix, floor.floorNumber, roomNumber),
            capacity: 0,
            vacant: 0,
            occupants: 0,
            occupants_list: []
          });
        }
        return rooms;
      });

      // Insert all rooms in a single batch
      const { error } = await supabase
        .from('rooms')
        .insert(roomsToInsert);
      
      if (error) throw error;
      
      onSuccess();
    } catch (error) {
      console.error('Error adding rooms:', error);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <p className="text-sm">Total Floors: <span className="font-medium">{formData.floors.length}</span></p>
          <p className="text-sm">Total Rooms: <span className="font-medium">{formData.floors.reduce((total, floor) => total + floor.roomCount, 0)}</span></p>
        </div>
        
        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-[#800000] text-white rounded hover:bg-[#600000] focus:outline-none focus:ring-2 focus:ring-[#800000] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Creating...' : 'Create Building'}
          </button>
        </div>
      </form>
    </div>
  );
}