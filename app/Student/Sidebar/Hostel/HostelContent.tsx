// HostelContent.tsx
'use client';
import { useEffect, useState } from 'react';
import HostelApplication from './HostelApplication/HostelApplication';
import HostelPaymentUpload from './UploadHostelFeeReceipt/HostelPaymentUpload';
import MessPaymentUpload from './UploadHostelFeeReceipt/MessPaymentUpload';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  name: string;
  email: string;
  id: string;
  role: string;
  department: string;
  year: string;
}

interface AllotmentDetails {
  building_name: string;
  room_number: string;
}

interface HostelContentProps {
  user: User;
}

export default function HostelContent({ user }: HostelContentProps) {
  const [hasSubmittedApplication, setHasSubmittedApplication] = useState(false);
  const [isAllotmentAccepted, setIsAllotmentAccepted] = useState(false);
  const [hasUploadedHostelReceipt, setHasUploadedHostelReceipt] = useState(false);
  const [hasUploadedMessReceipt, setHasUploadedMessReceipt] = useState(false);
  const [allotmentDetails, setAllotmentDetails] = useState<AllotmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBlockAllotted, setIsBlockAllotted] = useState(false);
  const [hostelFees, setHostelFees] = useState<number | null>(null);
  const [messFees, setMessFees] = useState<number | null>(null);

  useEffect(() => {
    async function checkExistingApplication() {
      if (!user || !user.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: applicationData, error: applicationError } = await supabase
          .from('hostel_applications_db')
          .select('hostel_applications_status, provisional_status, block_allotment_status, hostel_fees_url, mess_fees_url, hostel_id, room_id, final_allotment_status, hostel_fees, mess_fees')
          .eq('student_id', user.id)
          .single();

        if (applicationError && applicationError.code !== 'PGRST116') {
          console.error('Error fetching hostel application:', applicationError.message);
          setError(`Failed to fetch application: ${applicationError.message}`);
          return;
        }

        const status = applicationData?.hostel_applications_status || '';
        const provisional = applicationData?.provisional_status || '';
        const hostelReceipt = applicationData?.hostel_fees_url;
        const messReceipt = applicationData?.mess_fees_url;
        const blockStatus = applicationData?.block_allotment_status || '';

        setIsBlockAllotted(blockStatus === 'Allotted');
        setHasSubmittedApplication(applicationData !== null && ['Pending', 'Accepted'].includes(status));
        setIsAllotmentAccepted(applicationData !== null && status === 'Accepted' && provisional === 'Accepted');
        setHasUploadedHostelReceipt(!!hostelReceipt);
        setHasUploadedMessReceipt(!!messReceipt);
        setHostelFees(applicationData?.hostel_fees || null);
        setMessFees(applicationData?.mess_fees || null);

        if (
          status === 'Accepted' &&
          provisional === 'Accepted' &&
          applicationData?.final_allotment_status === true &&
          applicationData?.room_id &&
          applicationData?.hostel_id
        ) {
          const { data: roomData } = await supabase
            .from('room_db')
            .select('number')
            .eq('room_id', applicationData.room_id)
            .single();

          const { data: hostelData } = await supabase
            .from('hostel_db')
            .select('name')
            .eq('hostel_id', applicationData.hostel_id)
            .single();

          setAllotmentDetails({
            building_name: hostelData?.name || 'Not assigned',
            room_number: roomData?.number?.toString() || 'Not assigned',
          });
        }
      } catch (error) {
        console.error('Unexpected error checking hostel application:', error);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    checkExistingApplication();
  }, [user]);

  if (isLoading || !user) return <div>Loading user data...</div>;
  if (error) return <div className="text-red-500 p-6">{error}</div>;

  if (hasSubmittedApplication) {
    return (
      <div className="p-6 w-full space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Hostel Application</h2>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Your hostel application has been submitted successfully.</span>
          </div>
        </div>

        {isAllotmentAccepted && isBlockAllotted && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Upload Hostel Fee Receipt</h2>
              {hostelFees !== null && !hasUploadedHostelReceipt && (
                <p className="text-lg font-medium">Hostel Fees: ₹{hostelFees}</p>
              )}
              {hasUploadedHostelReceipt ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <strong className="font-bold">Success!</strong>
                  <span className="block sm:inline"> Your hostel fee receipt has been submitted successfully.</span>
                </div>
              ) : (
                <HostelPaymentUpload user={user} onUploadSuccess={() => setHasUploadedHostelReceipt(true)} />
              )}
              
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Upload Mess Fee Receipt</h2>
              {messFees !== null && !hasUploadedMessReceipt && (
                <p className="text-lg font-medium">Mess Fees: ₹{messFees}</p>
              )}
              {hasUploadedMessReceipt ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <strong className="font-bold">Success!</strong>
                  <span className="block sm:inline"> Your mess fee receipt has been submitted successfully.</span>
                </div>
              ) : (
                <MessPaymentUpload user={user} onUploadSuccess={() => setHasUploadedMessReceipt(true)} />
              )}
              
            </div>

            {allotmentDetails && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Allotment Details</h2>
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
                  <strong className="font-bold">Your Room Allotment:</strong>
                  <div className="mt-2">
                    <p>Hostel: {allotmentDetails.building_name}</p>
                    <p>Room Number: {allotmentDetails.room_number}</p>
                  </div>
                </div>
              </div>
            )}
          </>
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
