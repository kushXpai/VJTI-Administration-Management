// app/Student/Sidebar/Hostel/HostelContent.tsx

'use client';
import { useEffect, useState } from 'react';
import HostelApplication from './HostelApplication/HostelApplication';
import UploadHostelFeeReceipt from './UploadHostelFeeReceipt/UploadHostelFeeReceipt';
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
  const [hasUploadedReceipt, setHasUploadedReceipt] = useState(false);
  const [allotmentDetails, setAllotmentDetails] = useState<AllotmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkExistingApplication() {
      if (!user || !user.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('hostel_applications')
          .select('hostel_application_status, allotment_status, hostel_fee_receipt_url, building_name, room_number')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching hostel application:', error.message);
          setError(`Failed to fetch application: ${error.message}`);
          return;
        }

        setHasSubmittedApplication(
          data !== null && ['Pending', 'Accepted'].includes(data?.hostel_application_status || '')
        );

        setIsAllotmentAccepted(
          data !== null &&
          data.hostel_application_status === 'Accepted' &&
          data.allotment_status === 'Accepted'
        );

        setHasUploadedReceipt(
          data !== null && data.hostel_fee_receipt_url !== null
        );

        if (data && data.allotment_status === 'Accepted') {
          setAllotmentDetails({
            building_name: data.building_name || 'Not assigned',
            room_number: data.room_number || 'Not assigned',
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
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Your hostel application has been submitted successfully.</span>
          </div>
        </div>

        {isAllotmentAccepted && (
          <>
            

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


            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Allotment Details</h2>
              {allotmentDetails ? (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
                  <strong className="font-bold">Your Room Allotment:</strong>
                  <div className="mt-2">
                    <p>Building: {allotmentDetails.building_name}</p>
                    <p>Room Number: {allotmentDetails.room_number}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
                  <span>Allotment details are being processed.</span>
                </div>
              )}
            </div>
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