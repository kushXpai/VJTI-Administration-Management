// app/Admin/HostelManagement/RoomAllotment/Types/Type.ts
export type HostelBlock = 'PG Block' | 'C Block' | 'D Block' | 'B Block';
export type Degree = 'BTech' | 'MTech' | 'MCA' | 'Diploma';
export type Course = string;
export type Gender = 'Male' | 'Female';
export type ApplicationStatus = 'Pending' | 'Accepted' | 'Rejected'; // Ensure these match database values

export interface HostelApplication {
  id: string;
  student_id: string;
  name: string;
  course: Course;
  gender: Gender;
  hostel_allotment_status: ApplicationStatus;
  hostel_block?: string | null;
  room_number?: string | null;
}

export interface Room {
  id: number;
  building_name: HostelBlock;
  type: 'Boys' | 'Girls';
  floor: number;
  room_number: string;
  capacity: number;
  vacant: number;
  occupants: number;
  occupants_list: string[];
}