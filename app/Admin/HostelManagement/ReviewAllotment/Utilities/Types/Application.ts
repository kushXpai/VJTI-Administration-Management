// app/Admin/HostelManagement/ReviewApplications/Utilities/Types/Application.ts

export interface Application {
  id: string;
  student_id: string | null;

  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile_number: number;

  father_name: string;
  father_mobile: number;
  mother_name: string;
  mother_mobile: number;
  guardian_name: string;
  guardian_mobile: number;

  present_address_line1: string;
  present_address_line2?: string;
  present_state: string;
  present_city: string;
  present_pin_code: number;

  permanent_address_line1: string;
  permanent_address_line2?: string;
  permanent_state: string;
  permanent_city: string;
  permanent_pin_code: number;

  cet_application_id: string;
  cet_rank: number;

  course: string; // course_enum
  category: string; // category_enum

  is_pwd?: boolean;
  pwd_details?: string;
  is_ews?: boolean;
  is_religious_minority?: boolean;
  religious_minority_details?: string;

  aadhar_card_number: string;

  student_photo_url?: string;
  aadhar_card_url?: string;
  college_fees_url?: string;
  college_application_form_url?: string;
  consent_form_url?: string;

  hostel_applications_status: 'Accepted' | 'Pending' | 'Rejected';
  provisional_status: 'Accepted' | 'Pending' | 'Rejected';
  block_allotment_status: 'Accepted' | 'Pending' | 'Rejected';

  room_id?: string | null;
  hostel_id?: string | null;

  hostel_fees: number;
  mess_fees: number;

  hostel_payment_type: 'Full' | 'Partial';
  hostel_fees_url?: string;
  hostel_feed_paid: number;

  mess_payment_type: 'Full' | 'Partial';
  mess_fees_url?: string;
  mess_feed_paid: number;

  review_fee_status: 'Pending' | 'Paid';

  rejection_remark?: string;

  hostel_partial?: boolean;
  hostel_feed_pending: number;
  mess_partial?: boolean;
  mess_feed_pending: number;
  mess_balance: number;

  hostel_alltment_status: 'Accepted' | 'Pending' | 'Rejected';
  hostel_fees_status: 'Pending' | 'Paid';
  final_allotment_status: boolean;

  created_at?: string;
  updated_at?: string;
}
