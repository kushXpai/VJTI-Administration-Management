// types/hostelTypes.ts
export type Application = {
  id: string;
  course: string;
  gender: string;
  cet_rank: number;
  cet_application_id: string; // Using this for student ID
  student_name: string;
  hostel_application_status: string;
  allotment_status: string;
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'VJ' | 'NT' | 'DT';
  is_ews: boolean;
  specialization?: string;
};

export type LatestPDFs = {
  [key: string]: {
    boys: string;
    girls: string;
  };
};

export type PDFFont = {
  widthOfTextAtSize: (text: string, size: number) => number;
};

export type DegreeType = {
  name: string;
  specializations: string[];
};

export type CountsType = Record<string, Record<string, { boys: number; girls: number }>>;