export interface Profile {
  name: string;
}

export interface StudentApplication {
  id: string;
  student_id: string;
  hostel_applications_status: string;
  provisional_status: string;
  block_allotment_status: string;
  room_id: string | null;
  hostel_id: string | null;
  hostel_fees: number | null;         // ✅ NEW
  mess_id: string | null;             // ✅ NEW
  mess_fees?: number | null;          // optional (used in auto allocation)
  mess_payment_type?: string | null;  // optional (e.g. 'Full', 'Partial')
  course: string;
  gender: string;
  profiles_db: Profile[];
}


export interface Room {
  room_id: string;
  hostel_id: string;
  number: number;
  capacity: number;
  vacancy: number;
  occupancy: number;
  occupant_ids: string[];
  occupants: { student_id: string; name: string }[];
}

export interface Hostel {
  hostel_id: string;
  name: string;
  type: string;
  hostel_fees: number;
  mess_id: string | null;
}

export interface Mess {
  mess_id: string;
  name: string;
  mess_fees: number;
}
