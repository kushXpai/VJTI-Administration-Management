import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
// Define MessOption type directly in this file
interface MessOption {
  id: string;
  name: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const useFetchMessOptions = () => {
  const [messOptions, setMessOptions] = useState<MessOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessOptions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("mess_db")
        .select("mess_id, name")
        .order("name", { ascending: true });
      if (error) {
        console.error("Error fetching mess options from mess_db:", error.message);
        setError(`Error loading mess options: ${error.message}`);
        setMessOptions([]);
      } else {
        setMessOptions((data || []).map((item) => ({ id: item.mess_id, name: item.name })));
        setError(null);
      }
      setLoading(false);
    };
    fetchMessOptions();
  }, []);

  return { messOptions, loading, error };
};

// Define MessOption type for clarity
interface MessOption {
  id: string;
  name: string;
}