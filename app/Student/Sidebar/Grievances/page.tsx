// app/Student/Sidebar/Grievances/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import GrievancesContent, { User } from './GrievancesContent';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function GrievancesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get user from localStorage
  useEffect(() => {
    const getUserFromLocalStorage = () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          throw new Error('No user found in local storage');
        }
        
        const parsedUser = JSON.parse(userData);
        if (!parsedUser || !parsedUser.id) {
          throw new Error('Invalid user data');
        }
        
        // Ensure all required fields are present
        const completeUser: User = {
          id: parsedUser.id,
          name: parsedUser.name,
          email: parsedUser.email,
          role: parsedUser.role,
          department: parsedUser.department || '',
          year: parsedUser.year || ''
        };
        
        setUser(completeUser);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error getting user from localStorage:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    getUserFromLocalStorage();
  }, []);

  // Update Supabase RLS policy to be more permissive for development
  useEffect(() => {
    const updateGrievancePolicy = async () => {
      try {
        // This is just a client-side check to log if there might be an issue
        // Real policy changes must be done on the server or directly in Supabase
        const { error } = await supabase
          .from('grievances')
          .select('count()')
          .limit(1);
          
        if (error) {
          console.warn('You might need to update RLS policies:', error.message);
          console.log('Consider making policies more permissive for development');
        }
      } catch (error) {
        console.error('Error checking policies:', error);
      }
    };
    
    if (user?.id) {
      updateGrievancePolicy();
    }
  }, [user?.id]);

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error || !user) {
    return (
      <div className="p-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'User not found. Please log in again.'}
        </div>
        <button 
          className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
          onClick={() => router.push('/')}
          type="button"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return <GrievancesContent user={user} />;
}