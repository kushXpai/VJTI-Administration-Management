// app/Student/Sidebar/Hostel/page.tsx

'use client';
import { useEffect, useState } from 'react';
import HostelApplication from './HostelApplication/page';
import UploadHostelFeeReceipt from './UploadHostelFeeReceipt/page';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface HostelContentProps {
  user: any;
}

export default function HostelContent({ user }: HostelContentProps) {
  const [hasSubmittedApplication, setHasSubmittedApplication] = useState(false);
  const [isAllotmentAccepted, setIsAllotmentAccepted] = useState(false);
  const [hasUploadedReceipt, setHasUploadedReceipt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function checkExistingApplication() {
      if (!user || !user.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Check if user has an application and its status
        const { data, error } = await supabase
          .from('hostel_applications')
          .select('hostel_application_status, allotment_status, hostel_fee_receipt_url')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching hostel application:', error?.message || 'Unknown error');
        }   
        
        // Set state based on conditions:
        // 1. If no data found (user.id doesn't exist in table)
        // 2. If data exists but status is Pending or Accepted
        setHasSubmittedApplication(
          data !== null && ['Pending', 'Accepted'].includes(data?.hostel_application_status || '')
        );
        
        // Check if both hostel_application_status and allotment_status are Accepted
        setIsAllotmentAccepted(
          data !== null && 
          data.hostel_application_status === 'Accepted' && 
          data.allotment_status === 'Accepted'
        );
        
        // Check if receipt has been uploaded
        setHasUploadedReceipt(
          data !== null && data.hostel_fee_receipt_url !== null
        );
        
      } catch (error) {
        console.error('Error checking hostel application:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkExistingApplication();
  }, [user]);

  if (isLoading || !user) return <div>Loading user data...</div>;

  if (hasSubmittedApplication) {
    return (
      <div className="p-6 w-full space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Hostel Application</h2>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Your hostel application has been submitted successfully.</span>
          </div>
        </div>
        
        {isAllotmentAccepted && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Upload Payment Receipt</h2>
            {hasUploadedReceipt ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> Your hostel fee receipt has been submitted successfully.</span>
              </div>
            ) : (
              <UploadHostelFeeReceipt user={user} />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Hostel Application</h2>
        <HostelApplication user={user} />
      </div>
    </div>
  );
}