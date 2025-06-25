// // app/Student/Sidebar/Hostel/HostelContent.tsx

// 'use client';
// import { useEffect, useState } from 'react';
// import HostelApplication from './HostelApplication/HostelApplication';
// import UploadHostelFeeReceipt from './UploadHostelFeeReceipt/UploadHostelFeeReceipt';
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// interface User {
//   name: string;
//   email: string;
//   id: string;
//   role: string;
//   department: string;
//   year: string;
// }

// interface AllotmentDetails {
//   building_name: string;
//   room_number: string;
// }

// interface HostelContentProps {
//   user: User;
// }

// export default function HostelContent({ user }: HostelContentProps) {
//   const [hasSubmittedApplication, setHasSubmittedApplication] = useState(false);
//   const [isAllotmentAccepted, setIsAllotmentAccepted] = useState(false);
//   const [hasUploadedReceipt, setHasUploadedReceipt] = useState(false);
//   const [allotmentDetails, setAllotmentDetails] = useState<AllotmentDetails | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function checkExistingApplication() {
//       if (!user || !user.id) {
//         setIsLoading(false);
//         return;
//       }

//       // 

//       try {
//         // Step 1: Fetch application status from hostel_applications_db
//         const { data: applicationData, error: applicationError } = await supabase
//           .from('hostel_applications_db')
//           .select('hostel_applications_status, provisional_status, hostel_fees_url')
//           .eq('id', user.id)
//           .single();

//         if (applicationError && applicationError.code !== 'PGRST116') {
//           console.error('Error fetching hostel application:', applicationError.message);
//           setError(`Failed to fetch application: ${applicationError.message}`);
//           return;
//         }

//         setHasSubmittedApplication(
//           applicationData !== null && ['Pending', 'Accepted'].includes(applicationData?.hostel_applications_status || '')
//         );

//         setIsAllotmentAccepted(
//           applicationData !== null &&
//           applicationData.hostel_applications_status === 'Accepted' &&
//           applicationData.provisional_status === 'Accepted'
//         );

//         setHasUploadedReceipt(
//           applicationData !== null && applicationData.hostel_fees_url !== null
//         );

//         // Step 2: If provisionally accepted, fetch room details from accepted_hostel_applications
//         if (
//           applicationData &&
//           applicationData.provisional_status === 'Accepted'
//         ) {
//           const { data: allotmentData, error: allotmentError } = await supabase
//             .from('accepted_hostel_applications')
//             .select('building_name, room_number')
//             .eq('id', user.id)
//             .single();

//           if (allotmentError) {
//             console.error('Error fetching allotment details:', allotmentError.message);
//             setError(`Failed to fetch allotment details: ${allotmentError.message}`);
//             return;
//           }

//           setAllotmentDetails({
//             building_name: allotmentData?.building_name || 'Not assigned',
//             room_number: allotmentData?.room_number || 'Not assigned',
//           });
//         }

//       } catch (error) {
//         console.error('Unexpected error checking hostel application:', error);
//         setError('An unexpected error occurred. Please try again later.');
//       } finally {
//         setIsLoading(false);
//       }

//     }

//     checkExistingApplication();
//   }, [user]);

//   if (isLoading || !user) return <div>Loading user data...</div>;
//   if (error) return <div className="text-red-500 p-6">{error}</div>;

//   if (hasSubmittedApplication) {
//     return (
//       <div className="p-6 w-full space-y-6">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-xl font-semibold mb-6">Hostel Application</h2>
//           <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
//             <strong className="font-bold">Success!</strong>
//             <span className="block sm:inline"> Your hostel application has been submitted successfully.</span>
//           </div>
//         </div>

//         {isAllotmentAccepted && (
//           <>


//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h2 className="text-xl font-semibold mb-6">Upload Payment Receipt</h2>
//               {hasUploadedReceipt ? (
//                 <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
//                   <strong className="font-bold">Success!</strong>
//                   <span className="block sm:inline"> Your hostel fee receipt has been submitted successfully.</span>
//                 </div>
//               ) : (
//                 <UploadHostelFeeReceipt user={user} />
//               )}
//             </div>


//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h2 className="text-xl font-semibold mb-6">Allotment Details</h2>
//               {allotmentDetails ? (
//                 <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
//                   <strong className="font-bold">Your Room Allotment:</strong>
//                   <div className="mt-2">
//                     <p>Building: {allotmentDetails.building_name}</p>
//                     <p>Room Number: {allotmentDetails.room_number}</p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
//                   <span>Allotment details are being processed.</span>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 w-full">
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-xl font-semibold mb-6">Hostel Application</h2>
//         <HostelApplication user={user} />
//       </div>
//     </div>
//   );
// }

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
  building_name: string; // Will be hostel name
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
        // Step 1: Fetch application data
        const { data: applicationData, error: applicationError } = await supabase
          .from('hostel_applications_db')
          .select('hostel_applications_status, provisional_status, hostel_fees_url, hostel_id, room_id')
          .eq('student_id', user.id)
          .single();

        if (applicationError && applicationError.code !== 'PGRST116') {
          console.error('Error fetching hostel application:', applicationError.message);
          setError(`Failed to fetch application: ${applicationError.message}`);
          return;
        }

        const status = applicationData?.hostel_applications_status || '';
        const provisional = applicationData?.provisional_status || '';
        const feesUploaded = applicationData?.hostel_fees_url;

        setHasSubmittedApplication(applicationData !== null && ['Pending', 'Accepted'].includes(status));
        setIsAllotmentAccepted(applicationData !== null && status === 'Accepted' && provisional === 'Accepted');
        setHasUploadedReceipt(!!feesUploaded);

        // Step 2: If provisionally accepted, fetch room and hostel details
        if (isAllotmentAccepted && applicationData?.room_id && applicationData?.hostel_id) {
          const { data: roomData, error: roomError } = await supabase
            .from('room_db')
            .select('number')
            .eq('room_id', applicationData.room_id)
            .single();

          const { data: hostelData, error: hostelError } = await supabase
            .from('hostel_db')
            .select('name')
            .eq('hostel_id', applicationData.hostel_id)
            .single();

          if (roomError) {
            console.error('Error fetching room details:', roomError.message);
            setError(`Failed to fetch room details: ${roomError.message}`);
            return;
          }

          if (hostelError) {
            console.error('Error fetching hostel name:', hostelError.message);
            setError(`Failed to fetch hostel details: ${hostelError.message}`);
            return;
          }

          setAllotmentDetails({
            building_name: hostelData?.name || 'Not assigned',
            room_number: roomData?.number || 'Not assigned',
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
                    <p>Hostel: {allotmentDetails.building_name}</p>
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
