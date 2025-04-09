// app/Admin/HostelManagement/ReviewApplications/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../supabase/supabaseClient';
import ApplicationsList from './Utilities/Components/ApplicationsList';
import CourseFilter from './Utilities/Components/CourseFilter';
import CourseSidebar from './Utilities/Components/CourseSidebar';
import { courseMapping } from './Utilities/Constants/courseData';
import LoadingSpinner from './Utilities/Components/LoadingSpinner';
import Image from 'next/image';

export default function ReviewApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseGroups, setCourseGroups] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch hostel applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('hostel_applications')
        .select('*');

      if (applicationsError) throw applicationsError;

      // Fetch profiles to get names
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'student');

      if (profilesError) throw profilesError;

      setApplications(applicationsData || []);
      setProfiles(profilesData || []);

      // Group applications by course
      const groups: Record<string, any[]> = {};
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

  const updateApplicationStatus = async (id: string, status: 'Accepted' | 'Pending' | 'Rejected') => {
    try {
      const { error } = await supabase
        .from('hostel_applications')
        .update({ hostel_application_status: status })
        .eq('id', id);

      if (error) throw error;

      // Update local state to reflect the change
      setApplications(prev =>
        prev.map(app =>
          app.id === id ? { ...app, hostel_application_status: status } : app
        )
      );

      // Update course groups state
      setCourseGroups(prev => {
        const newGroups = { ...prev };
        Object.keys(newGroups).forEach(course => {
          newGroups[course] = newGroups[course].map(app =>
            app.id === id ? { ...app, hostel_application_status: status } : app
          );
        });
        return newGroups;
      });

      // Trigger a refresh of the sidebar by reloading the page
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  // Get student name from profile
  const getStudentName = (studentId: string) => {
    const profile = profiles.find(p => p.id === studentId);
    return profile ? profile.name : 'Unknown Student';
  };

  // Handle course selection
  const handleCourseChange = (course: string | null) => {
    setSelectedCourse(course);
  };

  // Get applications for the selected course or all if none selected
  const getApplicationsToDisplay = () => {
    if (!selectedCourse) {
      return Object.entries(courseGroups);
    }

    return Object.entries(courseGroups)
      .filter(([course]) => course === selectedCourse);
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
        {/* Sidebar - Full height and shifted to the left */}
        <div className="w-1/4 p-4 bg-gray-50 min-h-screen">
          <CourseSidebar />
        </div>
        
        {/* Main Content */}
        <div className="w-3/4 p-6">
          <div className="mb-8">
            <CourseFilter
              courses={Object.keys(courseGroups)}
              courseMapping={courseMapping}
              selectedCourse={selectedCourse}
              onCourseChange={handleCourseChange}
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