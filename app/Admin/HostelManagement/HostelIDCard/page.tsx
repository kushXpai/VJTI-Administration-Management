'use client';

import { useState, useEffect } from 'react';
import { DegreesData, getCourseDbName } from './utils/courseData';
import StudentList from './components/StudentList';
import { Student } from './types/studentTypes';
import { supabase } from '../../../../supabase/supabaseClient';
import Header from '@/app/Components/Header';
import Footer from '@/app/Components/Footer';

export default function HostelIDCard() {
  const [selectedStream, setSelectedStream] = useState<string>('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const { data: applications, error: appError } = await supabase
          .from('hostel_applications_db')
          .select(`
            student_id,
            mobile_number,
            guardian_mobile,
            present_address_line1,
            present_address_line2,
            present_state,  
            present_city,
            present_pin_code,
            course,
            student_photo_url
          `)
          .eq('final_allotment_status', 'TRUE');

        if (appError) {
          console.error('Error fetching hostel applications:', appError);
          setErrorMessage(`Failed to fetch hostel applications: ${appError.message}`);
          return;
        }

        if (!applications || applications.length === 0) {
          setStudents([]);
          return;
        }

        const applicationIds = applications.map(app => app.student_id);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles_db')
          .select('student_id, name')
          .in('student_id', applicationIds);

        if (profileError) {
          console.error('Error fetching profiles:', profileError);
          setErrorMessage(`Failed to fetch profiles: ${profileError.message}`);
          return;
        }

        const profileMap = new Map(profiles?.map(profile => [profile.student_id, profile.name]) || []);

        const mappedStudents: Student[] = applications.map((item: any, index: number) => ({
          id: index + 1,
          student_name: profileMap.get(item.student_id) || 'Unknown',
          course: item.course || 'Unknown Course',
          present_address_line1: item.present_address_line1 || '',
          present_address_line2: item.present_address_line2 || '',
          present_state: item.present_state || '',
          present_city: item.present_city || '',
          present_pin_code: item.present_pin_code || '',
          contact_number: item.mobile_number || '',
          guardian_contact: item.guardian_mobile || '',
          photo_url: item.student_photo_url || '',
          student_id: item.student_id || `STUDENT_${index + 1}`,
        }));

        setStudents(mappedStudents);
      } catch (err: any) {
        console.error('Unexpected error:', err);
        setErrorMessage(`Unexpected error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredDegrees = selectedStream
    ? DegreesData.filter(degree => degree.name === selectedStream)
    : [];

  const filteredStudents = selectedSpecialization && selectedStream
    ? students.filter(student => {
        const dbCourse = getCourseDbName(selectedStream, selectedSpecialization);
        return dbCourse && dbCourse === student.course;
      })
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-8 text-center">Hostel ID Card Management</h1>

          {loading && <p className="text-gray-600 text-center">Loading students...</p>}
          {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}

          {/* Stream Filter */}
          <div className="mb-8">
            <label className="block mb-2 text-lg font-semibold">Select Stream</label>
            <select
              value={selectedStream}
              onChange={(e) => {
                setSelectedStream(e.target.value);
                setSelectedSpecialization(null);
              }}
              className="border border-gray-300 rounded p-2 w-full"
            >
              <option value="">-- Choose a stream --</option>
              {DegreesData.map((degree) => (
                <option key={degree.name} value={degree.name}>
                  {degree.name}
                </option>
              ))}
            </select>
          </div>

          {/* Specializations */}
          {filteredDegrees.map(degree => (
            <div key={degree.name} className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">{degree.name}</h2>
              <div className="flex flex-wrap gap-4">
                {degree.specializations.map(spec => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialization(spec)}
                    className="bg-[#800000] text-white px-4 py-2 rounded hover:bg-[#990000]"
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Students List */}
          {selectedSpecialization && !loading && !errorMessage && (
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-4">
                Students for {selectedSpecialization}
              </h3>
              <StudentList
                students={filteredStudents}
                specialization={selectedSpecialization}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
