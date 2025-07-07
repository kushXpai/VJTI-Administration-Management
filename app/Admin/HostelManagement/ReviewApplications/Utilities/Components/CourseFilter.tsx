// app/Admin/HostelManagement/ReviewApplications/Utilities/Components/CourseFilter.tsx

import React from 'react';

interface CourseFilterProps {
  courses: string[];
  courseMapping: Record<string, string>;
  selectedCourse: string | null;
  onCourseChange: (course: string | null) => void;
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
}

const CourseFilter: React.FC<CourseFilterProps> = ({
  courses,
  courseMapping,
  selectedCourse,
  onCourseChange,
  selectedStatus,
  onStatusChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Course and Application Status:
      </label>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Course Filter */}
        <div className="flex flex-1 gap-2">
          <select
            id="courseFilter"
            value={selectedCourse || ''}
            onChange={(e) => onCourseChange(e.target.value || null)}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course} value={course}>
                {courseMapping[course as keyof typeof courseMapping] || course}
              </option>
            ))}
          </select>
          {selectedCourse && (
            <button
              onClick={() => onCourseChange(null)}
              className="py-2 px-4 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex flex-1 gap-2">
          <select
            id="statusFilter"
            value={selectedStatus || ''}
            onChange={(e) => onStatusChange(e.target.value || null)}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="Accepted">Accepted</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
          {selectedStatus && (
            <button
              onClick={() => onStatusChange(null)}
              className="py-2 px-4 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseFilter;
