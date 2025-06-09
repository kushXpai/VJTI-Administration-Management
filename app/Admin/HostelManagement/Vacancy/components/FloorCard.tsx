import { Floor } from '../types';
import RoomCard from './RoomCard';

interface FloorCardProps {
  floor: Floor;
  hoveredRoom: string | null;
  onRoomHover: (roomId: string | null) => void;
  getRoomStatusColor: (status: string) => string;
  getStatusTextColor: (status: string) => string;
}

const FloorCard = ({
  floor,
  hoveredRoom,
  onRoomHover,
  getRoomStatusColor,
  getStatusTextColor,
}: FloorCardProps) => {
  console.log(`Rendering FloorCard for floor ${floor.id}:`, floor);

  return (
    <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
      <div className="font-bold text-lg mb-4">
        {floor.name}{' '}
        <span className="text-sm font-normal text-gray-600">
          {floor.roomCount} rooms
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {floor.rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onHover={onRoomHover}
            isHovered={hoveredRoom === room.id}
            getRoomStatusColor={getRoomStatusColor}
            getStatusTextColor={getStatusTextColor}
          />
        ))}
      </div>
    </div>
  );
};

export default FloorCard;