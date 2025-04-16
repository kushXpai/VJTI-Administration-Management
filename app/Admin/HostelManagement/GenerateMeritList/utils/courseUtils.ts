// utils/courseUtils.ts

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