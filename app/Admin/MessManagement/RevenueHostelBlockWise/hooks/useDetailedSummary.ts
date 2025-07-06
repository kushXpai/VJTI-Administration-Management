import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DetailedSummaryData } from '../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const useDetailedSummary = () => {
  const [summaryData, setSummaryData] = useState<DetailedSummaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase.rpc('get_hostel_detailed_summary');
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setSummaryData(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { summaryData, loading, error, fetchData };
};
