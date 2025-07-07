// Import the StudentApplication type from Types/Type.ts
import { StudentApplication } from '../Types/Type';

export const COURSE_CATEGORIES = {
  Diploma: [
    'Diploma in Civil Engineering',
    'Diploma in Electrical Engineering',
    'Diploma in Electronics Engineering',
    'Diploma in Mechanical Engineering',
    'Diploma in Textile Manufacturers',
    'Diploma in Chemical Engineering',
  ],
  BTech: [
    'B.Tech Degree in Civil Engineering',
    'B.Tech Degree in Computer Engineering',
    'B.Tech Degree in Electrical Engineering',
    'B.Tech Degree in Electronics Engineering',
    'B.Tech Degree in Electronics & Telecommunication Engineering',
    'B.Tech Degree in Information Technology',
    'B.Tech Degree in Mechanical Engineering',
    'B.Tech Degree in Production Engineering',
    'B.Tech Degree in Textile Technology',
  ],
  MCA: ['Master of Computer Application'],
  MTech: [
    'M.Tech Degree in Civil Engineering',
    'M.Tech Degree in Computer Engineering',
    'M.Tech Degree in Electrical Engineering',
    'M.Tech Degree in Internet of Things (IOT)',
    'M.Tech Degree in Electronics & Telecommunication Engineering',
    'M.Tech Degree in Mechanical Engineering',
    'M.Tech Degree in Production Engineering',
    'M.Tech Degree in Project Management',
    'M.Tech Degree in Technical Textile',
    'M.Tech Degree in Defence Technology',
  ],
};

export const getCourseCategory = (course: string): string => {
  for (const [category, courses] of Object.entries(COURSE_CATEGORIES)) {
    if (courses.includes(course)) return category;
  }
  return 'Unknown';
};

export const filterByCourse = (students: StudentApplication[], category: string): StudentApplication[] => {
  if (category === 'All') return students;
  const courses = COURSE_CATEGORIES[category as keyof typeof COURSE_CATEGORIES] || [];
  return students.filter(student => courses.includes(student.course));
};