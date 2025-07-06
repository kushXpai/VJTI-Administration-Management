export interface Student {
    student_id: string;
    name: string;
    cet_application_id: string;
    mess_id: string | null;
    mess_name: string | null;
    hostel_id: string | null;
    hostel_name: string | null;
  }
  
  export interface RawStudentRow {
    student_id: string;
    cet_application_id: string;
    mess_id: string | null;
    hostel_id: string | null;
    profile_name: string | null;
    mess_name: string | null;
    hostel_name: string | null;
  }

  
export interface MessOption {
    id: string;
    name: string;
  }