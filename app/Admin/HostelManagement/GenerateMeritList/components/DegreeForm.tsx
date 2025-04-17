// components/DegreeForm.tsx

import React from 'react';
import { GenerateButton } from './GenerateButton';
import { PDFViewButtons } from './PDFViewButtons';
import { CountsType } from '../types/hostelTypes';

interface DegreeFormProps {
  degree: {
    name: string;
    specializations: string[];
  };
  counts: CountsType;
  pdfUrls: Record<string, string>;
  loading: Record<string, boolean>;
  validationErrors?: Record<string, string>;
  handleInputChange: (degree: string, specialization: string, gender: 'boys' | 'girls', value: number) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleGenerate: (degree: string) => void;
}

export default function DegreeForm({
  degree,
  counts,
  pdfUrls,
  loading,
  validationErrors = {},
  handleInputChange,
  handleKeyDown,
  handleGenerate,
}: DegreeFormProps) {
  // Check for validation errors for this degree
  const hasValidationErrors = Object.entries(validationErrors).some(([key, value]) => 
    key.startsWith(degree.name) && value !== ''
  );

  // Check if at least one count is greater than 0
  const hasNonZeroCount = degree.specializations.some(specialization => {
    const boysCount = Number(counts[degree.name]?.[specialization]?.boys) || 0;
    const girlsCount = Number(counts[degree.name]?.[specialization]?.girls) || 0;
    return boysCount > 0 || girlsCount > 0;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">{degree.name}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {degree.specializations.map((specialization) => (
          <div key={specialization} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">{specialization}</h3>
            
            <div className="space-y-4">
              {/* Boys Input */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Boys Count
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={counts[degree.name]?.[specialization]?.boys ?? ''}
                    onChange={(e) => handleInputChange(
                      degree.name,
                      specialization,
                      'boys',
                      e.target.value === '' ? 0 : parseInt(e.target.value)
                    )}
                    onKeyDown={handleKeyDown}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition-colors
                      ${validationErrors[`${degree.name}_${specialization}_boys`] 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300'}`}
                    min="0"
                    max="100"
                  />
                  {validationErrors[`${degree.name}_${specialization}_boys`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors[`${degree.name}_${specialization}_boys`]}
                    </p>
                  )}
                </div>
              </div>

              {/* Girls Input */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Girls Count
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={counts[degree.name]?.[specialization]?.girls ?? ''}
                    onChange={(e) => handleInputChange(
                      degree.name,
                      specialization,
                      'girls',
                      e.target.value === '' ? 0 : parseInt(e.target.value)
                    )}
                    onKeyDown={handleKeyDown}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition-colors
                      ${validationErrors[`${degree.name}_${specialization}_girls`] 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300'}`}
                    min="0"
                    max="100"
                  />
                  {validationErrors[`${degree.name}_${specialization}_girls`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors[`${degree.name}_${specialization}_girls`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
        <GenerateButton
          degree={degree.name}
          loading={loading}
          onClick={() => handleGenerate(degree.name)}
          disabled={hasValidationErrors || !hasNonZeroCount}
        />
        
        <PDFViewButtons
          degree={degree.name}
          pdfUrls={pdfUrls}
        />
      </div>
    </div>
  );
}