import { StudentApplication, Room, Hostel, Mess } from '../Types/Type';
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { getMessForHostel } from '../utils/autoAllocateRooms'; // ✅ Import this utility function
 

interface ManualAutoRoomAllocationProps {
  students: StudentApplication[];
  rooms: Room[];
  hostels: Hostel[];
  messes: Mess[];
  selectedStudentId: string | null;
  selectedRoomId: string | null;
  loading: boolean;
  onSelectStudent: (studentId: string) => void;
  onSelectRoom: (roomId: string) => void;
  onAllocateManually: () => void;
  onAutoAllocate: () => void;
  onCancel: () => void;
  buttonClassName?: string;
  autoButtonClassName?: string;
}

const ManualAutoRoomAllocation: React.FC<ManualAutoRoomAllocationProps> = ({
  students,
  rooms,
  hostels,
  messes,
  selectedStudentId,
  selectedRoomId,
  loading,
  onSelectStudent,
  onSelectRoom,
  onAllocateManually,
  onAutoAllocate,
  onCancel,
  buttonClassName = 'bg-[#800000] text-white px-4 py-2 rounded',
  autoButtonClassName = 'bg-[#800000] text-white px-4 py-2 rounded',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedStudentId) {
      setIsModalOpen(true);
    }
  }, [selectedStudentId]);

  const selectedRoom = rooms.find((r) => r.room_id === selectedRoomId);
  const occupantNames = selectedRoom?.occupants?.length
    ? selectedRoom.occupants.map((o) => o.name).join(', ')
    : 'None';

  const selectedStudent = selectedStudentId
    ? students.find((s) => s.student_id === selectedStudentId)
    : null;

  const studentName = selectedStudent?.profiles_db?.[0]?.name || 'N/A';

  const availableRooms = selectedHostelId
    ? rooms.filter((r) => r.hostel_id === selectedHostelId && r.vacancy > 0)
    : [];

  const handleAllocateManually = async () => {
  if (!selectedStudentId || !selectedRoomId) {
    alert("Please select both student and room.");
    return;
  }

  const student = students.find((s) => s.student_id === selectedStudentId);
  const room = rooms.find((r) => r.room_id === selectedRoomId);
  const hostel = hostels.find((h) => h.hostel_id === room?.hostel_id);

  if (!student || !room || !hostel) {
    alert("Invalid student, room, or hostel.");
    return;
  }

  const messName = getMessForHostel(hostel.name, student.gender);
  const mess = messes.find((m) => m.name === messName);

  const { error: updateStudentError } = await supabase
    .from('hostel_applications_db')
    .update({
      room_id: room.room_id,
      hostel_id: hostel.hostel_id,
      hostel_fees: hostel.hostel_fees,
      mess_id: mess?.mess_id || null,
      mess_fees: mess?.mess_fees || 0,
      mess_payment_type: 'Full',
      block_allotment_status: 'Allotted',
    })
    .eq('student_id', student.student_id);

  if (updateStudentError) {
    console.error("Failed to update student:", updateStudentError);
    alert("Student update failed!");
    return;
  }

  const { error: updateRoomError } = await supabase
    .from('room_db')
    .update({
      occupant_ids: [...room.occupant_ids, student.student_id],
      occupancy: room.occupancy + 1,
    })
    .eq('room_id', room.room_id);

  if (updateRoomError) {
    console.error("Failed to update room:", updateRoomError);
    alert("Room update failed!");
    return;
  }

  onAllocateManually(); // triggers refresh
  setIsModalOpen(false);
};

  return (
    <div>
     <button
  onClick={onAutoAllocate}
  className={`transition-transform transform hover:scale-105 hover:bg-[#a00000] active:scale-95 ${autoButtonClassName} mt-6 mb-6 px-6 py-3 rounded-lg shadow-md`}
  disabled={loading}
>
Auto Allocate Room
</button>


      {selectedStudentId && (
        <div className="mt-4 p-4 border border-gray-300 rounded">
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded ml-2 disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>

          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-[#800000]">
                  Manual Room Allocation
                </h2>
                <h3 className="text-lg font-bold mb-2">
                  Allocate Room for {studentName}
                </h3>

                {/* Select Hostel */}
                <label className="block font-medium mb-1">Select Hostel</label>
                <select
                  onChange={(e) => setSelectedHostelId(e.target.value)}
                  className="border p-2 mb-2 w-full"
                  disabled={loading}
                >
                  <option value="">Select Hostel</option>
                  {hostels.map((hostel) => (
                    <option key={hostel.hostel_id} value={hostel.hostel_id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>

                {/* Select Room */}
                {selectedHostelId && (
                  <>
                    <label className="block font-medium mb-1">Select Room</label>
                    <select
                      onChange={(e) => onSelectRoom(e.target.value)}
                      className="border p-2 w-full"
                      disabled={loading}
                      value={selectedRoomId || ''}
                    >
                      <option value="">Select Room</option>
                      {availableRooms.map((room) => (
                        <option key={room.room_id} value={room.room_id}>
                          {`Room ${room.number} (Vacancy: ${room.vacancy}, Occupants: ${
                            room.occupants?.length
                              ? room.occupants.map((o) => o.name).join(', ')
                              : 'None'
                          })`}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                <p className="mt-2">Current Occupants: {occupantNames}</p>

                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    onClick={handleAllocateManually}
                    className={`${buttonClassName} disabled:opacity-50`}
                    disabled={loading || !selectedRoomId}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManualAutoRoomAllocation;
