


import { Floor } from '../types';
import RoomMembersPopup from './RoomMembersPopup';

interface RoomCardProps {
  room: Floor['rooms'][0];
  onHover: (roomId: string | null) => void;
  isHovered: boolean;
  getRoomStatusColor: (status: string) => string;
  getStatusTextColor: (status: string) => string;
}

const RoomCard = ({
  room,
  onHover,
  isHovered,
  getRoomStatusColor,
  getStatusTextColor,
}: RoomCardProps) => {
  return (
    <div
      className={`border rounded p-4 relative hover:shadow-lg transition-all duration-200 ${getRoomStatusColor(
        room.status
      )}`}
      onMouseEnter={() => onHover(room.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="font-bold text-blue-800">{room.id}</div>
      <div className="text-sm">
        <div>Capacity: {room.capacity}</div>
        <div
          className={`font-medium ${
            room.status === 'full' ? 'text-red-600' : ''
          }`}
        >
          Occupied: {room.occupied}/{room.capacity}
        </div>
        <div
          className={`font-medium ${
            room.status === 'empty' ? 'text-green-600' : ''
          }`}
        >
          Vacant: {room.vacant}
        </div>
        <div
          className={`text-xs mt-1 font-medium ${getStatusTextColor(
            room.status
          )}`}
        >
          {room.status === 'full'
            ? 'Full'
            : room.status === 'empty'
            ? 'Empty'
            : 'Partially Occupied'}
        </div>
      </div>

      {isHovered && (
        <RoomMembersPopup
          room={room}
          onClose={() => onHover(null)}
        />
      )}
    </div>
  );
};

export default RoomCard;
// This component represents a card for each room in the hostel.