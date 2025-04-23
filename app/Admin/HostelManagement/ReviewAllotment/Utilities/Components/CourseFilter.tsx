import React from 'react';

interface CourseFilterProps {
  courses: string[];
  courseMapping: Record<string, string>;
  selectedCourse: string | null;
  selectedStatus: 'Paid' | 'Pending' | null;
  onCourseChange: (course: string | null) => void;
  onStatusChange: (status: 'Paid' | 'Pending' | null) => void;
}

const CourseFilter: React.FC<CourseFilterProps> = ({
  courses,
  courseMapping,
  selectedCourse,
  selectedStatus,
  onCourseChange,
  onStatusChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Course Filter */}
        <div>
          <label htmlFor="courseFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Course:
          </label>
          <div className="flex gap-2">
            <select
              id="courseFilter"
              value={selectedCourse || ''}
              onChange={(e) => onCourseChange(e.target.value || null)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {courseMapping[course as keyof typeof courseMapping] || course}
                </option>
              ))}
            </select>
            {selectedCourse && (
              <button
                onClick={() => onCourseChange(null)}
                className="py-2 px-3 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Payment Status:
          </label>
          <div className="flex gap-2">
            <select
              id="statusFilter"
              value={selectedStatus || ''}
              onChange={(e) => onStatusChange(e.target.value as 'Paid' | 'Pending' || null)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
            {selectedStatus && (
              <button
                onClick={() => onStatusChange(null)}
                className="py-2 px-3 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseFilter;
