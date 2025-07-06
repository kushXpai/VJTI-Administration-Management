export interface MessRevenueData {
    student_id: string;
    name: string;
    mess_block: string;
    mess_fees: number;
    mess_feed_paid: number;
    mess_feed_pending: number;
    mess_fees_url: string;
    mess_payment_type: string;
  }
  
  export interface MessSummaryData {
    mess_block: string;
    student_count: number;
    total_assigned: number;
    total_paid: number;
    total_pending: number;
  }
  
  export interface Notification {
    type: 'success' | 'error';
    message: string;
  }

