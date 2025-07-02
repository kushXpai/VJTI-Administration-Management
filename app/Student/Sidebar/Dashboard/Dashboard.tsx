// app/Student/Sidebar/Dashboard/Dashboard.tsx

'use client';
import { useEffect, useState } from 'react';
import { FiCoffee, FiAlertCircle, FiCalendar, FiBook } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';
import { supabase } from '@/supabase/supabaseClient';

interface User {
  id: string;
  name: string;
  department: string;
  year: string;
}

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [allotment, setAllotment] = useState<{ hostel?: string; room?: string } | null>(null);
  const [messBalance, setMessBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ inProgress: 0, resolved: 0, rejected: 0 });

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return setIsLoading(false);

      try {
        // 1️⃣ fetch application row
        const { data: app, error: appErr } = await supabase
          .from('hostel_applications_db')
          .select('final_allotment_status, mess_balance, hostel_id, room_id')
          .eq('student_id', user.id)
          .single();
        if (appErr && appErr.code !== 'PGRST116') throw appErr;

        setMessBalance(app?.mess_balance ?? null);

        if (app?.final_allotment_status) {
          // 2️⃣ fetch hostel name
          const { data: h, error: hErr } = await supabase
            .from('hostel_db')
            .select('name')
            .eq('hostel_id', app.hostel_id)
            .single();
          if (hErr) throw hErr;

          // 3️⃣ fetch room number
          const { data: r, error: rErr } = await supabase
            .from('room_db')
            .select('number')
            .eq('room_id', app.room_id)
            .single();
          if (rErr) throw rErr;

          setAllotment({ hostel: h.name, room: String(r.number) });
        } else {
          setAllotment(null);
        }

        // 4️⃣ fetch grievances
        const { data: grievances, error: gErr } = await supabase
          .from('grievances')
          .select('status')
          .eq('student_id', user.id);
        if (gErr) throw gErr;

        const inProgress = grievances.filter(g => g.status === 'In Progress').length;
        const resolved = grievances.filter(g => g.status === 'Resolved').length;
        const rejected = grievances.filter(g => g.status === 'Rejected').length;
        setStats({ inProgress, resolved, rejected });
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (isLoading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500 p-6">{error}</div>;

  return (
    <div>
      {/* Header omitted for brevity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Hostel Status</h3>
            <FaBuilding className="text-red-800" size={18} />
          </div>
          {allotment ? (
            <>
              <p className="text-3xl font-bold text-gray-800 mb-1">Room {allotment.room}</p>
              <p className="text-xl text-gray-500">• {allotment.hostel}</p>
            </>
          ) : (
            <p className="text-gray-500 text-sm italic">Allotment not finalized yet</p>
          )}
        </div>

        {/* Other cards: Mess Balance & Grievances */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Mess Balance</h3>
            <FiCoffee className="text-red-800" size={18} />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">
            {messBalance != null ? `₹${messBalance.toLocaleString()}` : 'N/A'}
          </p>
          <p className="text-sm text-gray-500">Valid until June 30, 2025</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Pending Concerns</h3>
            <FiAlertCircle className="text-red-800" size={18} />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">{stats.inProgress}</p>
          <p className="text-sm text-gray-500">{stats.resolved} resolved</p>
          <p className="text-sm text-gray-500">{stats.rejected} rejected</p>
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
                The hostel will remain open during the upcoming holidays. Students planning to stay must register at the warden’s office.
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