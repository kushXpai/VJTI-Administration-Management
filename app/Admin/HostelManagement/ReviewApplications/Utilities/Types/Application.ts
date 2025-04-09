// app/Admin/HostelManagement/ReviewApplications/Utilities/Types/Application.ts

export interface Application {
    id: string;
    hostel_application_status: 'Accepted' | 'Pending' | 'Rejected';
    cet_application_id: string;
    cet_rank: string | number;
    present_address_line1?: string;
    present_address_line2?: string;
    present_city: string;
    present_state: string;
    aadhar_card_number: string;
    photo_url: string;
    aadhar_card_url: string;
    acknowledgement_receipt_url: string;
    fee_receipt_url: string;
    course: string;
  }
  