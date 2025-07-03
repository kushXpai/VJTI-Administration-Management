'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../supabase/supabaseClient';
import ApplicationsList from './Utilities/Components/ApplicationsList';
import CourseFilter from './Utilities/Components/CourseFilter';
import CourseSidebar from './Utilities/Components/CourseSidebar';
import { courseMapping } from './Utilities/Constants/courseData';
import LoadingSpinner from './Utilities/Components/LoadingSpinner';
import Image from 'next/image';
import type { Application } from './Utilities/Types/Application';

interface Profile {
  id: string;
  name: string;
  email: string;
}

export default function ReviewApplications() {
  const [, setApplications] = useState<Application[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseGroups, setCourseGroups] = useState<Record<string, Application[]>>({});
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch hostel applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('hostel_applications_db')
        .select('*');

      if (applicationsError) throw applicationsError;

      // Fetch student profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles_db')
        .select('student_id, name, email')
        .eq('role', 'Student');

      if (profilesError) throw profilesError;

      setApplications(applicationsData || []);
      setProfiles(profilesData?.map(profile => ({
        id: profile.student_id,
        name: profile.name,
        email: profile.email
      })) || []);

      // Group applications by course
      const groups: Record<string, Application[]> = {};
      applicationsData?.forEach(app => {
        if (!app.course) return;
        if (!groups[app.course]) {
          groups[app.course] = [];
        }
        groups[app.course].push(app);
      });

      setCourseGroups(groups);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (
    id: string,
    status: 'Accepted' | 'Pending' | 'Rejected'
  ) => {
    try {
      const { error } = await supabase
        .from('hostel_applications_db')
        .update({ hostel_applications_status: status })
        .eq('id', id);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app =>
          app.id === id ? { ...app, hostel_applications_status: status } : app
        )
      );

      setCourseGroups(prev => {
        const newGroups = { ...prev };
        Object.keys(newGroups).forEach(course => {
          newGroups[course] = newGroups[course].map(app =>
            app.id === id ? { ...app, hostel_applications_status: status } : app
          );
        });
        return newGroups;
      });

      // Refresh sidebar
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStudentName = (studentId: string): string => {
    const profile = profiles.find((p: Profile) => p.id === studentId);
    return profile?.name ?? 'Unknown Student';
  };

  const handleCourseChange = (course: string | null) => {
    setSelectedCourse(course);
  };

  const getApplicationsToDisplay = () => {
    let filteredGroups = Object.entries(courseGroups);

  if (selectedCourse) {
    filteredGroups = filteredGroups.filter(([course]) => course === selectedCourse);
  }

  if (selectedStatus) {
    filteredGroups = filteredGroups
      .map(([course, apps]): [string, Application[]] => [
        course,
        apps.filter(app => app.hostel_applications_status === selectedStatus)
      ])
      .filter(([, apps]) => apps.length > 0);
  }

  return filteredGroups;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex justify-between items-center p-4 border-b border-gray-300 bg-white shadow">
        <div className="flex items-center gap-4">
          <Image src="/images/vjti_logo.svg" alt="VJTI Logo" width={50} height={50} />
          <div>
            <h1 className="text-xl font-bold text-[#800000]">Veermata Jijabai Technological Institute</h1>
            <p className="text-sm text-gray-600">Matunga East, Mumbai, Maharashtra 400019</p>
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-[#800000]">Hostel Applications Review</h1>
          <p className="text-sm text-gray-600">Admin Management Panel</p>
        </div>
      </header>

      <div className="flex w-full">
        <div className="w-1/4 p-4 bg-gray-50 min-h-screen">
          <CourseSidebar />
        </div>

        <div className="w-3/4 p-6">
          <div className="mb-8">
            <CourseFilter
              courses={Object.keys(courseGroups)}
              courseMapping={courseMapping}
              selectedCourse={selectedCourse}
              onCourseChange={handleCourseChange}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />
          </div>

          {getApplicationsToDisplay().length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 text-lg">No applications found</p>
            </div>
          ) : (
            getApplicationsToDisplay().map(([course, apps]) => (
              <div key={course} className="mb-12">
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-red-600">
                  {courseMapping[course as keyof typeof courseMapping] || course}
                </h2>
                <ApplicationsList
                  applications={apps}
                  getStudentName={getStudentName}
                  updateStatus={updateApplicationStatus}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
