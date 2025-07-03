// app/Admin/HostelManagement/ReviewApplications/Utilities/Types/Application.ts

export interface Application {
  id: string;
  student_id: string;
  hostel_applications_status: 'Accepted' | 'Pending' | 'Rejected';
  cet_application_id: string;
  cet_rank: number;
  present_address_line1?: string;
  present_address_line2?: string;
  present_city: string;
  present_state: string;
  aadhar_card_number: string;
  student_photo_url: string;
  aadhar_card_url: string;
  college_application_form_url: string;
  college_fees_url: string;
  course: string;
}
