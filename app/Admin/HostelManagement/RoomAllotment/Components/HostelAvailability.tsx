// app/Admin/HostelManagement/RoomAllotment/Components/HostelAvailability.tsx
import { useState } from 'react';
import { Room, HostelBlock } from '../Types/Type';

interface HostelAvailabilityProps {
  rooms: Room[];
}

export default function HostelAvailability({ rooms }: HostelAvailabilityProps) {
  const maleBuildings: HostelBlock[] = ['PG Block', 'C Block', 'D Block'];
  const femaleBuildings: HostelBlock[] = ['B Block'];
  const allBuildings: HostelBlock[] = [...maleBuildings, ...femaleBuildings];

  // State for the selected building
  const [selectedBuilding, setSelectedBuilding] = useState<string>('All Buildings');

  // Helper functions to calculate totals based on the selected building
  const getFilteredBuildings = (buildings: HostelBlock[]): HostelBlock[] => {
    if (selectedBuilding === 'All Buildings') {
      return buildings;
    }
    return buildings.filter((building) => building === selectedBuilding);
  };

  const getTotalCapacity = (buildings: HostelBlock[]) => {
    const filteredBuildings = getFilteredBuildings(buildings);
    return rooms
      .filter((room) => filteredBuildings.includes(room.building_name))
      .reduce((sum, room) => sum + room.capacity, 0);
  };

  const getTotalVacant = (buildings: HostelBlock[]) => {
    const filteredBuildings = getFilteredBuildings(buildings);
    return rooms
      .filter((room) => filteredBuildings.includes(room.building_name))
      .reduce((sum, room) => sum + room.vacant, 0);
  };

  return (
    <div className="border p-4 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-bold text-[#800000] mb-4">Hostel Rooms Availability</h2>

      {/* Building Filter Dropdown */}
      <div className="mb-4">
        <label htmlFor="buildingFilter" className="mr-2 font-medium text-gray-700">
          Filter by Building:
        </label>
        <select
          id="buildingFilter"
          value={selectedBuilding}
          onChange={(e) => setSelectedBuilding(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="All Buildings">All Buildings</option>
          {allBuildings.map((building) => (
            <option key={building} value={building}>
              {building}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Male Hostels */}
        <div>
          <h3 className="font-medium mb-2 text-gray-700">Boys Hostels</h3>
          {getFilteredBuildings(maleBuildings).length === 0 ? (
            <p className="text-gray-600">No boys hostels available for the selected building.</p>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Building & Room</th>
                  <th className="p-2 text-right">Available</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {rooms
                  .filter(
                    (room) =>
                      maleBuildings.includes(room.building_name) &&
                      (selectedBuilding === 'All Buildings' || room.building_name === selectedBuilding)
                  )
                  .map((room) => (
                    <tr key={room.id} className="border-t">
                      <td className="p-2">
                        {room.building_name} - Room {room.room_number}
                      </td>
                      <td className="p-2 text-right font-medium text-[#800000]">
                        {room.vacant}
                      </td>
                      <td className="p-2 text-right">{room.capacity}</td>
                    </tr>
                  ))}
                <tr className="border-t font-bold">
                  <td className="p-2">Total</td>
                  <td className="p-2 text-right">{getTotalVacant(maleBuildings)}</td>
                  <td className="p-2 text-right">{getTotalCapacity(maleBuildings)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Female Hostels */}
        <div>
          <h3 className="font-medium mb-2 text-gray-700">Girls Hostels</h3>
          {getFilteredBuildings(femaleBuildings).length === 0 ? (
            <p className="text-gray-600">No girls hostels available for the selected building.</p>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Building & Room</th>
                  <th className="p-2 text-right">Available</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {rooms
                  .filter(
                    (room) =>
                      femaleBuildings.includes(room.building_name) &&
                      (selectedBuilding === 'All Buildings' || room.building_name === selectedBuilding)
                  )
                  .map((room) => (
                    <tr key={room.id} className="border-t">
                      <td className="p-2">
                        {room.building_name} - Room {room.room_number}
                      </td>
                      <td className="p-2 text-right font-medium text-[#800000]">
                        {room.vacant}
                      </td>
                      <td className="p-2 text-right">{room.capacity}</td>
                    </tr>
                  ))}
                <tr className="border-t font-bold">
                  <td className="p-2">Total</td>
                  <td className="p-2 text-right">{getTotalVacant(femaleBuildings)}</td>
                  <td className="p-2 text-right">{getTotalCapacity(femaleBuildings)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}