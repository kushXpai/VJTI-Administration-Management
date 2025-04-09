// app/Admin/HostelManagement/ReviewApplications/Utilities/Components/CourseSidebar.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../../../../../supabase/supabaseClient';
import { courseMapping } from '../../Utilities/Constants/courseData';
import LoadingSpinner from './LoadingSpinner';

type CourseStats = {
  accepted: number;
  pending: number;
  rejected: number;
  total: number;
};

type CourseData = {
  [course: string]: CourseStats;
};

type CategoryData = {
  title: string;
  courses: CourseData;
};

export default function CourseSidebar() {
  const [categorizedData, setCategorizedData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalApplications, setTotalApplications] = useState(0);

  useEffect(() => {
    fetchApplicationStats();
  }, []);

  const fetchApplicationStats = async () => {
    setIsLoading(true);
    try {
      // Fetch all hostel applications
      const { data: applications, error } = await supabase
        .from('hostel_applications')
        .select('*');

      if (error) throw error;

      // Track the total number of applications
      setTotalApplications(applications?.length || 0);

      // Create a map to store course statistics
      const courseStatsMap: { [course: string]: CourseStats } = {};

      // Process applications
      applications?.forEach(app => {
        if (!app.course) return;

        // Initialize course stats if not exists
        if (!courseStatsMap[app.course]) {
          courseStatsMap[app.course] = {
            accepted: 0,
            pending: 0,
            rejected: 0,
            total: 0
          };
        }

        // Increment total count
        courseStatsMap[app.course].total++;

        // Increment appropriate status count
        if (app.hostel_application_status === 'Accepted') {
          courseStatsMap[app.course].accepted++;
        } else if (app.hostel_application_status === 'Pending') {
          courseStatsMap[app.course].pending++;
        } else if (app.hostel_application_status === 'Rejected') {
          courseStatsMap[app.course].rejected++;
        }
      });

      // Categorize courses
      const diplomaCourses: CourseData = {};
      const graduationCourses: CourseData = {};
      const postGraduationCourses: CourseData = {};

      // Only include courses that have applications
      Object.keys(courseStatsMap).forEach(course => {
        if (course.startsWith('Diploma')) {
          diplomaCourses[course] = courseStatsMap[course];
        } else if (course.startsWith('BTech')) {
          graduationCourses[course] = courseStatsMap[course];
        } else if (course.startsWith('MTech') || course === 'MCA') {
          postGraduationCourses[course] = courseStatsMap[course];
        }
      });

      // Create categorized data
      const categories: CategoryData[] = [];

      if (Object.keys(diplomaCourses).length > 0) {
        categories.push({ title: 'Diploma', courses: diplomaCourses });
      }

      if (Object.keys(graduationCourses).length > 0) {
        categories.push({ title: 'Graduation', courses: graduationCourses });
      }

      if (Object.keys(postGraduationCourses).length > 0) {
        categories.push({ title: 'Post Graduation', courses: postGraduationCourses });
      }

      setCategorizedData(categories);
    } catch (error) {
      console.error('Error fetching application stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCourseDisplayName = (courseKey: string): string => {
    return courseMapping[courseKey as keyof typeof courseMapping] || courseKey;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full">
      <h1 className="text-xl font-bold mb-4 pb-2 border-b-2 border-red-600">Application Statistics</h1>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div style={{ backgroundColor: '#86efac' }} className="w-5 h-5 rounded-sm"></div>
          <span className="text-sm ml-2 mr-4">Accepted</span>

          <div style={{ backgroundColor: '#fde047' }} className="w-5 h-5 rounded-sm"></div>
          <span className="text-sm ml-2 mr-4">Pending</span>

          <div style={{ backgroundColor: '#f87171' }} className="w-5 h-5 rounded-sm"></div>
          <span className="text-sm ml-2 mr-4">Rejected</span>

          <div style={{ backgroundColor: '#000000' }} className="w-5 h-5 rounded-sm"></div>
          <span className="text-sm ml-2">Total</span>
        </div>
      </div>

      {totalApplications === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600">No applications data available</p>
        </div>
      ) : categorizedData.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600">Applications found but not categorized</p>
        </div>
      ) : (
        categorizedData.map((category, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-2xl font-bold mb-3">{category.title}</h2>

            {Object.entries(category.courses).map(([courseKey, stats]) => (
              <div key={courseKey} className="mb-4">
                <p className="text-lg mb-2">{getCourseDisplayName(courseKey)}</p>
                <div className="flex" style={{ gap: '8px' }}>
                  <div style={{ backgroundColor: '#86efac' }} className="w-12 h-12 rounded-md flex items-center justify-center text-lg font-semibold">
                    {stats.accepted}
                  </div>
                  <div style={{ backgroundColor: '#fde047' }} className="w-12 h-12 rounded-md flex items-center justify-center text-lg font-semibold">
                    {stats.pending}
                  </div>
                  <div style={{ backgroundColor: '#f87171' }} className="w-12 h-12 rounded-md flex items-center justify-center text-lg font-semibold">
                    {stats.rejected}
                  </div>
                  <div style={{ backgroundColor: '#000000', color: '#ffffff' }} className="w-12 h-12 rounded-md flex items-center justify-center text-lg font-semibold">
                    {stats.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}