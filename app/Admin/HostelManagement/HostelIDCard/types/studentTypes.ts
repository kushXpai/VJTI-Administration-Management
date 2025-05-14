export interface Student {
  id: number;
  student_name: string;
  course: string;
  contact_number: string;
  guardian_contact: string;
  photo_url: string;
  originalCourseCode?: string; // Add this to store the original course code for filtering
  present_address_line1: string;
  present_address_line2: string;
  present_state: string;
  present_city: string;
  present_pin_code: string;
}