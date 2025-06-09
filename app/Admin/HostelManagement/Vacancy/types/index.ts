export interface Room {
  id: string; // Use room_number as the identifier
  building_name: string;
  type: 'Girls' | 'Boys';
  floor: number;
  room_number: string;
  capacity: number;
  vacant: number;
  occupants: number;
  occupants_list: string[]; // Array of student IDs
  created_at: string;
}

export interface Building {
  id: number;
  name: string;
  gender: 'Girls' | 'Boys';
  rooms: number;
  floors: number;
}

export interface Floor {
  id: number;
  blockId: number;
  name: string;
  roomCount: number;
  rooms: {
    id: string; // room_number
    capacity: number;
    occupied: number;
    vacant: number;
    students: {
      id: string;
      name: string;
      course: string;
    }[];
    status: 'full' | 'partial' | 'empty';
  }[];
}