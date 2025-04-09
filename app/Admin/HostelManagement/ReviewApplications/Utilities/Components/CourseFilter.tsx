// app/Admin/HostelManagement/ReviewApplications/Utilities/Components/CourseFilter.tsx

import React from 'react';

interface CourseFilterProps {
  courses: string[];
  courseMapping: Record<string, string>;
  selectedCourse: string | null;
  onCourseChange: (course: string | null) => void;
}

const CourseFilter: React.FC<CourseFilterProps> = ({
  courses,
  courseMapping,
  selectedCourse,
  onCourseChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <label htmlFor="courseFilter" className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Course:
      </label>
      <div className="flex gap-2">
        <select
          id="courseFilter"
          value={selectedCourse || ''}
          onChange={(e) => onCourseChange(e.target.value || null)}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
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
            className="mt-1 py-2 px-4 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseFilter;