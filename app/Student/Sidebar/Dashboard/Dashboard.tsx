'use client';

import { useEffect, useState } from 'react';
import { FiCoffee, FiAlertCircle, FiCalendar, FiBook } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';
import { supabase } from '@/supabase/supabaseClient';


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

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [allotmentDetails, setAllotmentDetails] = useState<AllotmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllotmentDetails() {
      if (!user || !user.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('hostel_applications')
          .select('allotment_status, building_name, room_number')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching allotment details:', error.message);
          setError(`Failed to fetch allotment details: ${error.message}`);
          return;
        }

        if (data && data.allotment_status === 'Accepted') {
          setAllotmentDetails({
            building_name: data.building_name || 'Not assigned',
            room_number: data.room_number || 'Not assigned',
          });
        } else {
          setAllotmentDetails({
            building_name: 'Not assigned',
            room_number: 'Not assigned',
          });
        }
      } catch (error) {
        console.error('Unexpected error fetching allotment details:', error);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllotmentDetails();
  }, [user]);

  if (isLoading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500 p-6">{error}</div>;

  return (
    <div>
      <div className="bg-gradient-to-r from-red-900 to-red-700 text-white rounded-2xl p-6 mb-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-2xl mb-2">Welcome back, {user?.name.split(' ')[0]}</h2>
            <p className="text-red-100">{user?.department} {user?.year}</p>
          </div>
          <div className="hidden sm:block">
            <FiBook size={48} className="text-red-200 opacity-50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Hostel Status</h3>
            <FaBuilding className="text-red-800" size={18} />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">
            {allotmentDetails?.room_number}
          </p>
          <p className="text-sm text-gray-500">• {allotmentDetails?.building_name}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Mess Balance</h3>
            <FiCoffee className="text-red-800" size={18} />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">₹3,240</p>
          <p className="text-sm text-gray-500">Valid until June 30, 2025</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Pending Concerns</h3>
            <FiAlertCircle className="text-red-800" size={18} />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">1</p>
          <p className="text-sm text-gray-500">1 in progress • 2 resolved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Recent Announcements</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-5 hover:bg-gray-50">
              <div className="flex justify-between mb-1">
                <h4 className="font-medium text-gray-800">Mess Menu Updated</h4>
                <span className="text-xs text-gray-500">April 1, 2025</span>
              </div>
              <p className="text-sm text-gray-600">
                New menu for the month of April is now available. Check the Mess Management section for details.
              </p>
            </div>
            <div className="p-5 hover:bg-gray-50">
              <div className="flex justify-between mb-1">
                <h4 className="font-medium text-gray-800">Holiday Notice</h4>
                <span className="text-xs text-gray-500">March 25, 2025</span>
              </div>
              <p className="text-sm text-gray-600">
                The hostel will remain open during the upcoming holidays. Students planning to stay must register at the
                warden's office.
              </p>
            </div>
            <div className="p-5 hover:bg-gray-50">
              <div className="flex justify-between mb-1">
                <h4 className="font-medium text-gray-800">Maintenance Schedule</h4>
                <span className="text-xs text-gray-500">March 18, 2025</span>
              </div>
              <p className="text-sm text-gray-600">
                Block B water tanks will be cleaned on April 10th. Water supply will be interrupted from 10 AM to 2 PM.
              </p>
            </div>
          </div>
          <div className="p-3 bg-gray-50 text-center">
            <button className="text-sm text-red-900 font-medium hover:underline">View All Announcements</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Upcoming Events</h3>
            <FiCalendar size={16} className="text-gray-500" />
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 hover:bg-gray-50">
              <div className="flex">
                <div className="bg-red-100 text-red-800 rounded p-2 text-center mr-4 w-12">
                  <div className="text-xs font-medium">APR</div>
                  <div className="text-lg font-bold">10</div>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Hostel Committee Meeting</p>
                  <p className="text-xs text-gray-500">4:00 PM • Hostel Common Room</p>
                </div>
              </div>
            </div>
            <div className="p-4 hover:bg-gray-50">
              <div className="flex">
                <div className="bg-red-100 text-red-800 rounded p-2 text-center mr-4 w-12">
                  <div className="text-xs font-medium">APR</div>
                  <div className="text-lg font-bold">15</div>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Mess Fee Payment Deadline</p>
                  <p className="text-xs text-gray-500">All Day • Online Payment</p>
                </div>
              </div>
            </div>
            <div className="p-4 hover:bg-gray-50">
              <div className="flex">
                <div className="bg-red-100 text-red-800 rounded p-2 text-center mr-4 w-12">
                  <div className="text-xs font-medium">APR</div>
                  <div className="text-lg font-bold">22</div>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Cultural Night</p>
                  <p className="text-xs text-gray-500">7:00 PM • Hostel Courtyard</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 bg-gray-50 text-center">
            <button className="text-sm text-red-900 font-medium hover:underline">View Full Calendar</button>
          </div>
        </div>
      </div>
    </div>
  );
}