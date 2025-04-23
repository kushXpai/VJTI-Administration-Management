// app/Student/Sidebar/Grievances/GrievancesContent.tsx

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import GrievanceForm from './Components/GrievanceForm';
import GrievancesList from './Components/GrievancesList';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define interfaces that match what your components expect
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  year: string;
}

export interface Grievance {
  id: string;
  student_id: string;
  category: 'Hostel' | 'Mess' | 'General' | 'Room Change';
  issue_text: string;
  image_url?: string;
  created_at: string;
  resolved_at?: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
}

interface GrievancesContentProps {
  user: User;
}

export default function GrievancesContent({ user }: GrievancesContentProps) {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    //console.log(currentDate);
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  
    if (user?.id) {
      fetchGrievances();
    }
  }, [user?.id, fetchGrievances]);

  async function fetchGrievances() {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching grievances:', error.message);
      } else if (data) {
        // Transform the data to ensure it matches our expected Grievance type
        const formattedGrievances: Grievance[] = data.map(item => ({
          id: item.id,
          student_id: item.student_id,
          category: item.category,
          issue_text: item.issue_text,
          image_url: item.image_url,
          created_at: item.created_at,
          resolved_at: item.resolved_at || undefined,
          status: item.status
        }));
        setGrievances(formattedGrievances);
      } else {
        setGrievances([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handleGrievanceSubmitted = () => {
    fetchGrievances();
    setActiveTab('list');
  };

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div></div>
          {activeTab === 'list' && (
            <button
              className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded"
              onClick={() => setActiveTab('new')}
              type="button"
            >
              New Complaint
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'list' ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <GrievancesList grievances={grievances} isLoading={isLoading} />
          </div>
        ) : (
          <GrievanceForm user={user} onGrievanceSubmitted={handleGrievanceSubmitted} />
        )}
      </div>
    </div>
  );
}