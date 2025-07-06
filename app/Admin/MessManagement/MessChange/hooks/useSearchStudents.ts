import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Student, RawStudentRow } from "../types/student";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const useSearchStudents = (searchTerm: string, trigger: boolean, setTrigger: (value: boolean) => void) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!trigger) return;
      if (!searchTerm) {
        setStudents([]);
        setTrigger(false);
        return;
      }
      setLoading(true);
      console.log("Fetching students with searchTerm:", searchTerm);
      const { data, error } = await supabase.rpc("search_students", {
        search_term: `%${searchTerm}%`,
      });

      if (error) {
        console.error("Error fetching students:", error.message, error.details);
        setMessage(`Error fetching students: ${error.message}`);
        setStudents([]);
      } else {
        console.log("Raw data from search_students:", data);
        if (data && Array.isArray(data)) {
          const mappedStudents = data.map((row: RawStudentRow) => ({
            student_id: row.student_id,
            name: row.profile_name || "Unknown",
            cet_application_id: row.cet_application_id,
            mess_id: row.mess_id,
            mess_name: row.mess_name || "N/A",
            hostel_id: row.hostel_id,
            hostel_name: row.hostel_name || "N/A",
          }));
          setStudents(mappedStudents);
          console.log("Mapped students:", mappedStudents);
          if (mappedStudents.length === 0) {
            setMessage("No students found for the search term.");
          } else if (new Set(mappedStudents.map(s => s.name)).size < mappedStudents.length) {
            setMessage("Multiple students with the same name found. Use ID or CET to differentiate.");
          } else {
            setMessage(null);
          }
        } else {
          console.warn("No valid data returned from search_students");
          setStudents([]);
          setMessage("No valid data returned from search.");
        }
      }
      setLoading(false);
      setTrigger(false);
    };
    fetchStudents();
  }, [searchTerm, trigger, setTrigger]);

  return { students, loading, message };
};