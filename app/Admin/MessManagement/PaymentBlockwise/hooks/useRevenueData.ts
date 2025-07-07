

// //// testing with the other table ie hostel_applications_db
// "use client";
// import { useState, useEffect } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { MessRevenueData, MessSummaryData, Notification } from '../types';

// export function useRevenueData() {
//   const supabase = createClientComponentClient();
//   const [revenueData, setRevenueData] = useState<MessRevenueData[]>([]);
//   const [summaryData, setSummaryData] = useState<MessSummaryData[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState<Notification | null>(null);
//   const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState<string>('');

//   const fetchRevenueData = async (p0: { startDate: string; endDate: string; }) => {
//     setLoading(true);
//     setNotification(null);
//     try {
//       const { data, error } = await supabase.rpc('get_mess_student_details', {
//         payment_status: paymentStatus || null,
//         search_term: searchTerm || null,
//       });

//       console.log('get_mess_student_details_test Response:', { data, error, payment_status: paymentStatus, search_term: searchTerm });

//       if (!data || data.length === 0) {
//         setNotification({ type: 'error', message: 'No student revenue records found.' });
//         setRevenueData([]);
//         console.log('RevenueData set to empty:', []);
//       } else {
//         setRevenueData(data);
//         console.log('RevenueData set to:', data);
//       }
//     } catch (error) {
//       console.error('Fetch Revenue Error:', error);
//       setNotification({
//         type: 'error',
//         message: error instanceof Error ? error.message : 'Unexpected error fetching revenue data',
//       });
//       setRevenueData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchSummaryData = async () => {
//     try {
//       const { data, error } = await supabase.rpc('get_mess_revenue_summary');

//       console.log('get_mess_revenue_summary_test Response:', { data, error });

//       if (error) {
//         console.error('Supabase RPC Error (get_mess_revenue_summary_test):', error);
//         throw new Error(error.message || 'Failed to fetch summary data');
//       }

//       setSummaryData(data || []);
//     } catch (error) {
//       console.error('Summary Fetch Error:', error);
//       setNotification({
//         type: 'error',
//         message: error instanceof Error ? error.message : 'Unexpected error fetching summary data',
//       });
//     }
//   };

//   useEffect(() => {
//     fetchRevenueData({ startDate: '2023-01-01', endDate: '2023-12-31' });
//     fetchSummaryData();
//   }, [paymentStatus, searchTerm]);

//   return {
//     revenueData,
//     summaryData,
//     loading,
//     notification,
//     setNotification,
//     paymentStatus,
//     setPaymentStatus,
//     searchTerm,
//     setSearchTerm,
//     fetchRevenueData,
//   };
// }




"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MessRevenueData, MessSummaryData, Notification } from '../types';

export function useRevenueData() {
  const supabase = createClientComponentClient();

  const [revenueData, setRevenueData] = useState<MessRevenueData[]>([]);
  const [summaryData, setSummaryData] = useState<MessSummaryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchRevenueData = useCallback(async () => {
    setLoading(true);
    setNotification(null);

    try {
      const { data, error } = await supabase.rpc('get_mess_student_details', {
        payment_status: paymentStatus || null,
        search_term: searchTerm || null,
      });

      console.log('get_mess_student_details Response:', { data, error, payment_status: paymentStatus, search_term: searchTerm });

      if (!data || data.length === 0) {
        setNotification({ type: 'error', message: 'No student revenue records found.' });
        setRevenueData([]);
      } else {
        setRevenueData(data);
      }
    } catch (error) {
      console.error('Fetch Revenue Error:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unexpected error fetching revenue data',
      });
      setRevenueData([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, paymentStatus, searchTerm]);

  const fetchSummaryData = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_mess_revenue_summary');

      console.log('get_mess_revenue_summary Response:', { data, error });

      if (error) {
        throw new Error(error.message || 'Failed to fetch summary data');
      }

      setSummaryData(data || []);
    } catch (error) {
      console.error('Summary Fetch Error:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unexpected error fetching summary data',
      });
    }
  }, [supabase]);

  useEffect(() => {
    fetchRevenueData();
    fetchSummaryData();
  }, [fetchRevenueData, fetchSummaryData]);

  return {
    revenueData,
    summaryData,
    loading,
    notification,
    setNotification,
    paymentStatus,
    setPaymentStatus,
    searchTerm,
    setSearchTerm,
    fetchRevenueData,
  };
}
