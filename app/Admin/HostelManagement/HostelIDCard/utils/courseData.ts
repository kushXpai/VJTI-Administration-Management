export const uiToDbCourseMap: Record<string, Record<string, string>> = {
  'B.Tech': {
    'Civil Engineering': 'B.Tech Degree in Civil Engineering',
    'Computer Engineering': 'B.Tech Degree in Computer Engineering',
    'Electrical Engineering': 'B.Tech Degree in Electrical Engineering',
    'Electronics Engineering': 'B.Tech Degree in Electronics Engineering',
    'Electronics & Telecommunication': 'B.Tech Degree in Electronics & Telecommunication Engineering',
    'Information Technology': 'B.Tech Degree in Information Technology',
    'Mechanical Engineering': 'B.Tech Degree in Mechanical Engineering',
    'Production Engineering': 'B.Tech Degree in Production Engineering',
    'Textile Technology': 'B.Tech Degree in Textile Technology',
  },
  'M.Tech': {
    'Civil Engineering': 'M.Tech Degree in Civil Engineering',
    'Computer Engineering': 'M.Tech Degree in Computer Engineering',
    'Electrical Engineering': 'M.Tech Degree in Electrical Engineering',
    'Internet of Things (IOT)': 'M.Tech Degree in Internet of Things (IOT)',
    'Electronics & Telecommunication': 'M.Tech Degree in Electronics & Telecommunication Engineering',
    'Mechanical Engineering': 'M.Tech Degree in Mechanical Engineering',
    'Production Engineering': 'M.Tech Degree in Production Engineering',
    'Project Management': 'M.Tech Degree in Project Management',
    'Technical Textile': 'M.Tech Degree in Technical Textile',
    'Defence Technology': 'M.Tech Degree in Defence Technology',
  },
  'Diploma': {
    'Civil Engineering': 'Diploma in Civil Engineering',
    'Electrical Engineering': 'Diploma in Electrical Engineering',
    'Electronics Engineering': 'Diploma in Electronics Engineering',
    'Mechanical Engineering': 'Diploma in Mechanical Engineering',
    'Textile Manufacturers': 'Diploma in Textile Manufacturers',
    'Chemical Engineering': 'Diploma in Chemical Engineering',
  },
  'MCA': {
    '': 'Master of Computer Application',
    'Master of Computer Applications': 'Master of Computer Application',
  },
};

export const DegreesData = [
  {
    name: 'B.Tech',
    specializations: Object.keys(uiToDbCourseMap['B.Tech']),
  },
  {
    name: 'M.Tech',
    specializations: Object.keys(uiToDbCourseMap['M.Tech']),
  },
  {
    name: 'MCA',
    specializations: ['Master of Computer Applications'],
  },
  {
    name: 'Diploma',
    specializations: Object.keys(uiToDbCourseMap['Diploma']),
  },
];

// Utility: Get the DB course value for selected stream + specialization
export const getCourseDbName = (stream: string, specialization: string): string | null => {
  const map = uiToDbCourseMap[stream];
  if (map) {
    return map[specialization] ?? null;
  }
  return null;
};

// Utility: Format a clean, standardized file name
export const formatCourseFileName = (stream: string, specialization: string, year: number): string => {
  const degree = stream.toUpperCase();

  const formattedSpecialization = specialization
    ? specialization.trim().toUpperCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '')
    : '';

  if (degree === 'mca') {
    return `mca-${year}.pdf`;
  }

  return `${degree}-${formattedSpecialization}-${year}.pdf`;
};
