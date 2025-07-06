import { useState } from 'react';
import { supabase } from '@/supabase/supabaseClient';

export const useChangeRoom = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeRoom = async (studentId: string, newRoomId: string, newHostelId: string | null) => {
    setLoading(true);
    setError(null);

    console.log('🔍 Calling RPC with:', {
      p_student_id: studentId,
      p_new_room_id: newRoomId,
      p_new_hostel_id: newHostelId,
    });

    const { error } = await supabase.rpc('change_student_room', {
      p_student_id: studentId,
      p_new_room_id: newRoomId,
      p_new_hostel_id: newHostelId,
    });

    setLoading(false);

    if (error) {
      console.error('❌ RPC Error:', error);
      setError(error.message);
      return false;
    }

    return true;
  };

  return { changeRoom, loading, error };
};
