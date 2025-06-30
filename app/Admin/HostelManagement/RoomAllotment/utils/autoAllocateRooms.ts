import { supabase } from '@/supabase/supabaseClient';
import { StudentApplication, Room, Hostel, Mess } from '../Types/Type';

export const getMessForHostel = (hostelName: string, gender: string): string | null => {
  if (["C Block", "D Block", "E Block"].includes(hostelName)) return hostelName;
  if (hostelName === "PG Block" && gender === "Male") {
    return Math.random() < 0.5 ? "C Block" : "D Block";
  }
  if (["A Block", "B Block", "E Block"].includes(hostelName) && gender === "Female") {
    return "E Block";
  }
  return null;
};

export const autoAllocateRooms = async (
  students: StudentApplication[],
  rooms: Room[],
  hostels: Hostel[],
  messes: Mess[],
  refreshData: () => void
) => {
  const eligibleStudents = students.filter(
    (s) =>
      !s.room_id &&
      s.hostel_applications_status === 'Accepted' &&
      s.provisional_status === 'Accepted' &&
      s.block_allotment_status === 'Pending'
  );

  const vacantRooms = rooms.filter((r) => r.vacancy > 0);

  for (const student of eligibleStudents) {
    const room = vacantRooms.find((r) => r.vacancy > 0);
    if (!room) break;

    const hostel = hostels.find((h) => h.hostel_id === room.hostel_id);
    if (!hostel) continue;

    const messName = getMessForHostel(hostel.name, student.gender);
    const mess = messes.find((m) => m.name === messName);

    // Update student application
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
      .eq('student_id', student.student_id)
      .select();

    if (updateStudentError) {
      console.error('Error updating student:', updateStudentError);
      continue;
    }

    // Update room occupants
    const { error: updateRoomError } = await supabase
      .from('room_db')
      .update({
        occupant_ids: [...room.occupant_ids, student.student_id],
        occupancy: room.occupancy + 1,
      })
      .eq('room_id', room.room_id)
      .select();

    if (updateRoomError) {
      console.error('Error updating room:', updateRoomError);
      continue;
    }

    // Update local memory
    room.occupant_ids.push(student.student_id);
    room.occupancy += 1;
  }

  refreshData();
};
