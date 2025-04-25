

export interface Room {
    id: number;
    building_name: string;
    type: string;
    floor: number;
    room_number: string;
    capacity: number;
    vacant: number;
    occupants: number;
    occupants_list: {
      id: string;
      
    }[];
    created_at: string;
  }
  
  export interface Building {
    id: number;
    name: string;
    gender: string;
    rooms: number;
    floors: number;
  }
  
  export interface Floor {
    id: number;
    blockId: number;
    name: string;
    roomCount: number;
    rooms: {
      id: string;
      capacity: number;
      occupied: number;
      vacant: number;
      students: {
        name: string;
        id: string;
        course: string;
      }[];
      status: 'full' | 'partial' | 'empty';
    }[];
  }