// components/DegreeForm.tsx

import React from 'react';
import { DegreeType, CountsType } from '../types/hostelTypes';
import MeritListTable from './MeritListTable';
import GenerateButton from './GenerateButton';

interface DegreeFormProps {
  degree: DegreeType;
  counts: CountsType;
  pdfUrls: Record<string, string>;
  loading: Record<string, boolean>;
  handleInputChange: (degree: string, specialization: string, gender: 'boys' | 'girls', value: number) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleGenerate: (degree: string) => void;
}

const DegreeForm: React.FC<DegreeFormProps> = ({
  degree,
  counts,
  pdfUrls,
  loading,
  handleInputChange,
  handleKeyDown,
  handleGenerate,
}) => {
  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-[#800000] mb-4">{degree.name}</h2>
      <MeritListTable
        degree={degree}
        counts={counts}
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
      />
      <div className="flex items-center space-x-4 mt-4">
        <GenerateButton
          isLoading={loading[degree.name]}
          onClick={() => handleGenerate(degree.name)}
          text="Generate"
          loadingText="Processing..."
        />

        {pdfUrls[`${degree.name}_Boys`] && (
          <button
            onClick={() => window.open(pdfUrls[`${degree.name}_Boys`], '_blank')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Download Boys PDF
          </button>
        )}
        {pdfUrls[`${degree.name}_Girls`] && (
          <button
            onClick={() => window.open(pdfUrls[`${degree.name}_Girls`], '_blank')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Download Girls PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default DegreeForm;