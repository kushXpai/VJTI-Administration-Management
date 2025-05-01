// app/Admin/HostelManagement/RoomAllotment/utils/courseUtils.ts
export const degreesData = [
    {
      name: 'Bachelor of Technology (B.Tech)',
      specializations: [
        'Mechanical Engineering',
        'Computer Engineering',
        'Civil Engineering',
        'Production Engineering',
        'Electrical Engineering',
        'Textile Engineering',
        'Defence Technology',
      ],
    },
    {
      name: 'Master of Technology (M.Tech)',
      specializations: [
        'Mechanical Engineering',
        'Computer Engineering',
        'Civil Engineering',
        'Production Engineering',
        'Electrical Engineering',
        'Textile Engineering',
        'Defence Technology',
      ],
    },
    {
      name: 'Master of Computer Application (MCA)',
      specializations: ['MCA'],
    },
    {
      name: 'Diploma',
      specializations: ['Diploma'],
    },
  ];
  
  // Map degree and specialization to course format in database
  export const mapToDbCourse = (degree: string, specialization: string): string => {
    if (degree === 'Bachelor of Technology (B.Tech)') {
      return `BTech${specialization.replace(/\s+/g, '')}`;
    } else if (degree === 'Master of Technology (M.Tech)') {
      return `MTech${specialization.replace(/\s+/g, '')}`;
    } else if (degree === 'Master of Computer Application (MCA)') {
      return 'MCA';
    } else if (degree === 'Diploma') {
      return 'Diploma';
    }
    return '';
  };
  
  // Reverse mapping: Convert database course format to readable degree and specialization
  export const mapFromDbCourse = (dbCourse: string): { degree: string; specialization: string } => {
    if (dbCourse === 'MCA') {
      return { degree: 'Master of Computer Application (MCA)', specialization: 'MCA' };
    }
    if (dbCourse === 'Diploma') {
      return { degree: 'Diploma', specialization: 'Diploma' };
    }
    if (dbCourse.startsWith('BTech')) {
      const specialization = dbCourse.replace('BTech', '');
      const readableSpecialization = specialization.replace(/([A-Z])/g, ' $1').trim();
      return { degree: 'Bachelor of Technology (B.Tech)', specialization: readableSpecialization };
    }
    if (dbCourse.startsWith('MTech')) {
      const specialization = dbCourse.replace('MTech', '');
      const readableSpecialization = specialization.replace(/([A-Z])/g, ' $1').trim();
      return { degree: 'Master of Technology (M.Tech)', specialization: readableSpecialization };
    }
    return { degree: '', specialization: '' };
  };
  
  // Format course for display: Return only the specialization (or course name for MCA/Diploma)
  export const formatCourseDisplay = (dbCourse: string): string => {
    const { degree, specialization } = mapFromDbCourse(dbCourse);
    // For MCA and Diploma, return the course name as-is
    if (dbCourse === 'MCA' || dbCourse === 'Diploma') {
      return dbCourse;
    }
    // For BTech and MTech, return only the specialization
    return specialization;
  };