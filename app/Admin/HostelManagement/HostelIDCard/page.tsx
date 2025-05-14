//app/Admin/HostelManagement/HostelIDCard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DegreesData } from './utils/courseUtils';
import StudentList from './components/StudentList';
import { Student } from './types/studentTypes';
import { supabase } from '../../../../supabase/supabaseClient';
import { courseMapping } from './utils/courseData';

// Helper function to map full specialization names to course codes
const getCourseCodeFromSpecialization = (specialization: string, stream: string): string[] => {
  const courseCodes: string[] = [];

  // Map based on the stream and specialization
  if (stream === 'Diploma') {
    if (specialization === 'Diploma') {
      courseCodes.push('Diploma in Civil Engineering');
      courseCodes.push('Diploma in Electrical Engineering');
      courseCodes.push('Diploma in Electronics Engineering');
      courseCodes.push('Diploma in Mechanical Engineering');
      courseCodes.push('Diploma in Textile Manufacturers');
      courseCodes.push('Diploma in Chemical Engineering');
    }
  } else if (stream === 'Bachelor of Technology (B.Tech)') {
    const mapping: Record<string, string> = {
      'Civil Engineering': 'btechCivilEngineering',
      'Computer Engineering': 'BTechComputerEngineering',
      'Electrical Engineering': 'btechElectricalEngineering',
      'Electronics Engineering': 'btechElectronicsEngineering',
      'Electronics and Telecommunication Engineering': 'btechElectronicsTelecommunicationEngineering',
      'Information Technology': 'btechInformationTechnology',
      'Mechanical Engineering': 'btechMechanicalEngineering',
      'Production Engineering': 'btechProductionEngineering',
      'Textile Technology': 'btechTextileTechnology',
      // Map AI and Data Science to Computer Engineering as a fallback
      'Artificial Intelligence and Data Science': 'btechComputerEngineering',
    };
    const courseCode = mapping[specialization];
    if (courseCode) {
      courseCodes.push(courseCode);
    } else {
      console.warn(`No course code mapping found for B.Tech specialization: ${specialization}`);
    }
  } else if (stream === 'Master of Technology (M.Tech)') {
    const mapping: Record<string, string> = {
      'Construction Engineering and Management': 'mtechCivilEngineering',
      'Environmental Engineering': 'mtechCivilEngineering',
      'Power Systems Engineering': 'mtechElectricalEngineering',
      'Machine Design': 'mtechMechanicalEngineering',
      'Information Technology': 'mtechComputerEngineering',
      'Communication and Signal Processing': 'mtechElectronicsTelecommunicationEngineering',
      'Data Science': 'mtechComputerEngineering', // Fallback to Computer Engineering
      'Internet of Things (IOT)': 'mtechIOT',
      'Production Engineering': 'mtechProductionEngineering',
      'Project Management': 'mtechProjectManagement',
      'Technical Textile': 'mtechTechnicalTextile',
      'Defence Technology': 'mtechDefenceTechnology',
    };
    const courseCode = mapping[specialization];
    if (courseCode) {
      courseCodes.push(courseCode);
    } else {
      console.warn(`No course code mapping found for M.Tech specialization: ${specialization}`);
    }
  } else if (stream === 'Master of Computer Applications (MCA)') {
    if (specialization === 'Master of Computer Applications') {
      courseCodes.push('MCA');
    }
  }

  return courseCodes;
};

export default function HostelIDCard() {
  const [selectedStream, setSelectedStream] = useState<string>('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch students from Supabase when the component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        console.log('Supabase client:', supabase);

        // Step 1: Fetch hostel applications
        const { data: applications, error: appError } = await supabase
          .from('hostel_applications')
          .select(`
            id,
            mobile_number,
            guardian_mobile,
            present_address_line1,
            present_address_line2,
            present_state,  
            present_city,
            present_pin_code,
            course,
            photo_url
          `)
          .eq('allotment_status', 'Accepted');

        console.log('Hostel applications response:', { applications, appError });

        if (appError) {
          console.error('Error fetching hostel applications:', appError);
          setErrorMessage(`Failed to fetch hostel applications: ${appError.message || 'Unknown error'}`);
          return;
        }

        if (!applications || applications.length === 0) {
          console.log('No students found with allotment_status = "Accepted".');
          setStudents([]);
          return;
        }

        // Step 2: Fetch profiles for the application IDs
        const applicationIds = applications.map(app => app.id);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', applicationIds);

        console.log('Profiles response:', { profiles, profileError });

        if (profileError) {
          console.error('Error fetching profiles:', profileError);
          setErrorMessage(`Failed to fetch profiles: ${profileError.message || 'Unknown error'}`);
          return;
        }

        // Step 3: Join the data manually
        const profileMap = new Map(profiles?.map(profile => [profile.id, profile.name]) || []);

        // Map the fetched data to the Student type
        const mappedStudents: Student[] = applications.map((item: any, index: number) => ({
          id: index + 1,
          student_name: profileMap.get(item.id) || 'Unknown',
          course: courseMapping[item.course] || item.course || 'Unknown Course',
          present_address_line1: item.present_address_line1 || '',
          present_address_line2: item.present_address_line2 || '',
          present_state: item.present_state || '',
          present_city: item.present_city || '',
          present_pin_code: item.present_pin_code || '',
          contact_number: item.mobile_number || '',
          guardian_contact: item.guardian_mobile || '',
          photo_url: item.photo_url ||'',
          student_id: item.id || `STUDENT_${index + 1}`,
          originalCourseCode: item.course,
        }));

        setStudents(mappedStudents);
      } catch (err: any) {
        console.error('Unexpected error:', err);
        setErrorMessage(`Unexpected error: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredDegrees = selectedStream
    ? DegreesData.filter(degree => degree.name === selectedStream)
    : [];

  // Filter students based on the course code, not the full course name
  const filteredStudents = selectedSpecialization && selectedStream
    ? students.filter(student => {
        const courseCodes = getCourseCodeFromSpecialization(selectedSpecialization, selectedStream);
        return courseCodes.includes(student.originalCourseCode || '');
      })
    : [];

  return (
    <div className="min-h-screen flex flex-col">
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
              {degree.name !== 'Diploma' && (
                <>
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
                </>
              )}

              {degree.name === 'Diploma' && (
                <div>
                  <button
                    onClick={() => setSelectedSpecialization('Diploma')}
                    className="bg-[#800000] text-white px-4 py-2 rounded hover:bg-[#990000]"
                  >
                    Diploma
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Students */}
          {selectedSpecialization && !loading && !errorMessage && (
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-4">
                Students for {selectedSpecialization}
              </h3>
              <StudentList
                students={filteredStudents as Student[]}
                specialization={selectedSpecialization}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}