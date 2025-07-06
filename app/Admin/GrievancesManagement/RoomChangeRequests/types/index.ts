export interface StudentResult {
  id: string;
  cet_application_id: string;
  name: string;
  gender: string;
  mobile_number: string;
  course: string;
  room_number: string | null;
  building_name: string | null;
  hostel_allotment_status: 'Pending' | 'Accepted' | 'Rejected';
}

export interface Room {
  id: string;
  building_name: string;
  room_number: string;
  type: string;
  floor: number;
  capacity: number;
  vacant: number;
  occupants: number;
  occupants_list: string[];
}

export interface Student {
  id: string;
  name: string;
  building_name: string;
  course: string;
  room_number: number
}


export interface StudentResult {
  id: string;
  name: string;
  cet_application_id: string;
  course: string;
  gender: string;
  mobile_number: string;
  room_id: string | null;
  room_number: string | null;
  hostel_id: string | null;
  hostel_name: string;
  hostel_allotment_status: 'Pending' | 'Accepted' | 'Rejected';
}