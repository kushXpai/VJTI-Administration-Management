

import { Floor } from '../types';

interface RoomMembersPopupProps {
    room: Floor['rooms'][0];
    onClose: () => void;
  }
  
  const RoomMembersPopup = ({ room }: RoomMembersPopupProps) => {
    return (
      <div className="relative">

  
        {/* Hovering Container */}
        <div className="absolute top-full left-0 mt-2 bg-white shadow-md border p-4 rounded-lg z-10 w-64">
          <div className="font-semibold mb-2">Room {room.id} Members</div>
          {room.students.length === 0 ? (
            <div className="text-sm text-gray-500">No occupants</div>
          ) : (
            <ul className="text-sm space-y-3">
              {room.students.map((student) => (
                <li key={student.id} className="border-b pb-2">
                  <div><span className="font-medium">ID:</span> {student.id}</div>
                  <div><span className="font-medium">Name:</span> {student.name}</div>
                  <div><span className="font-medium">Course:</span> {student.course}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };
  
  export default RoomMembersPopup;
  
