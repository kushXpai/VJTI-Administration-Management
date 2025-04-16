// components/MeritListTable.tsx

import React from 'react';
import { CountsType } from '../types/hostelTypes';

interface MeritListTableProps {
  degree: {
    name: string;
    specializations: string[];
  };
  counts: CountsType;
  handleInputChange: (degree: string, specialization: string, gender: 'boys' | 'girls', value: number) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const MeritListTable: React.FC<MeritListTableProps> = ({
  degree,
  counts,
  handleInputChange,
  handleKeyDown,
}) => {
  return (
    <table className="w-full table-auto mb-4">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 text-left">Specialization</th>
          <th className="p-2">Boys</th>
          <th className="p-2">Girls</th>
        </tr>
      </thead>
      <tbody>
        {degree.specializations.map((spec) => (
          <tr key={spec} className="border-t">
            <td className="p-2">{spec}</td>
            <td className="p-2">
              <input
                type="number"
                min={0}
                value={counts[degree.name]?.[spec]?.boys || ''}
                onChange={(e) =>
                  handleInputChange(degree.name, spec, 'boys', Number(e.target.value))
                }
                onKeyDown={handleKeyDown}
                className="border rounded px-2 py-1 w-full"
              />
            </td>
            <td className="p-2">
              <input
                type="number"
                min={0}
                value={counts[degree.name]?.[spec]?.girls || ''}
                onChange={(e) =>
                  handleInputChange(degree.name, spec, 'girls', Number(e.target.value))
                }
                onKeyDown={handleKeyDown}
                className="border rounded px-2 py-1 w-full"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MeritListTable;