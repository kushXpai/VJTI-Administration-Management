import { useState, useCallback } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { StudentResult } from '../types';

interface UseStudentSearchResult {
  results: StudentResult[];
  loading: boolean;
  error: string | null;
  searchStudents: (term: string) => Promise<void>;
  swapStudentRooms: (studentId1: string, studentId2: string) => Promise<boolean>;
  swapLoading: boolean;
  swapError: string | null;
}

export const useStudentSearch = (): UseStudentSearchResult => {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [swapLoading, setSwapLoading] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);  // ✅ KEEP this

  const searchStudents = useCallback(async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('search_accepted_students', { search_term: term });
      if (error) throw error;

      const formattedData: StudentResult[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name ?? '',
        cet_application_id: item.cet_application_id ?? '',
        building_name: item.hostel_name ?? '',   
        room_number: item.room_number ?? null,
      }));

      setResults(formattedData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  }, []);

  const swapStudentRooms = useCallback(async (studentId1: string, studentId2: string) => {
    setSwapLoading(true);
    setSwapError(null);
    try {
      const { data, error } = await supabase.rpc('swap_student_rooms', {
        student_id1: studentId1,
        student_id2: studentId2,
      });

      if (error) throw error;

      return data === true;
    } catch (err: any) {
      setSwapError(err.message || 'Failed to swap rooms.');
      return false;
    } finally {
      setSwapLoading(false);
    }
  }, []);

  return { results, loading, error, searchStudents, swapStudentRooms, swapLoading, swapError };
};
