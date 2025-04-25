import FloorCard from './FloorCard';
import StatusLegend from './StatusLegend';
import { Building, Floor } from '../types';

interface RoomsViewProps {
  block: Building | null;
  floors: Floor[];
  onBack: () => void;
  onRoomHover: (id: string | null) => void;
  hoveredRoom: string | null;
  getRoomStatusColor: (status: string) => string;
  getStatusTextColor: (status: string) => string;
}

const RoomsView = ({
  block,
  floors,
  onBack,
  onRoomHover,
  hoveredRoom,
  getRoomStatusColor,
  getStatusTextColor,
}: RoomsViewProps) => {
  if (!block) return null;

  return (
    <>
      <div className="bg-white rounded-lg p-4 mb-6 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold text-red-800">Floors & Rooms</h1>
        <button
          onClick={onBack}
          className="text-blue-500 hover:underline flex items-center"
        >
          Back to Buildings
        </button>
      </div>

      <StatusLegend />

      {floors.length > 0 ? (
        floors.map((floor) => (
          <FloorCard
            key={floor.id}
            floor={floor}
            hoveredRoom={hoveredRoom}
            onRoomHover={onRoomHover}
            getRoomStatusColor={getRoomStatusColor}
            getStatusTextColor={getStatusTextColor}
          />
        ))
      ) : (
        <div className="bg-white rounded-lg p-4 shadow-md text-center text-gray-500">
          No floors found for this building
        </div>
      )}
    </>
  );
};

export default RoomsView;