// app/Admin/HostelManagement/GenerateMeritList/page.tsx
"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MeritListPage() {
  const degrees = [
    {
      name: 'Bachelor of Technology (B.Tech)',
      specializations: [
        'Mechanical Engineering',
        'Computer Engineering',
        'Civil Engineering',
        'Production Engineering',
        'Electrical Engineering',
        'Textile Engineering', // Added specialization
        'Defence Technology', // Added specialization
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
        'Textile Engineering', // Added specialization
        'Defence Technology', // Added specialization
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

  const [counts, setCounts] = useState<Record<string, Record<string, { boys: number; girls: number }>>>({});

  const handleInputChange = (degree: string, specialization: string, gender: 'boys' | 'girls', value: number) => {
    if (value >= 0) { // Ensure only non-negative values are set
      setCounts((prev) => ({
        ...prev,
        [degree]: {
          ...prev[degree],
          [specialization]: {
            ...prev[degree]?.[specialization],
            [gender]: value,
          },
        },
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only numbers, backspace, delete, tab, and arrow keys
    if (
      !/[0-9]/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== 'Tab' &&
      e.key !== 'ArrowLeft' &&
      e.key !== 'ArrowRight'
    ) {
      e.preventDefault();
    }
  };

  const handleGenerate = (degree: string) => {
    console.log(`Generating merit list for ${degree}:`, counts[degree]);
    // You would call your Supabase function here.
  };

  return (
    <div className="p-6 space-y-10">
      <Header
        rightContent={
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-[#800000]">Hostel Merit List</h1>
            <p className="text-sm text-gray-600">Admin Management Panel</p>
          </div>
        }
      />
      {degrees.map((degree) => (
        <div key={degree.name} className="border p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-[#800000] mb-4">{degree.name}</h2>
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
                      min={0} // Ensures only non-negative values
                      value={counts[degree.name]?.[spec]?.boys || ''}
                      onChange={(e) =>
                        handleInputChange(degree.name, spec, 'boys', Number(e.target.value))
                      }
                      onKeyDown={handleKeyDown} // Prevent invalid characters
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0} // Ensures only non-negative values
                      value={counts[degree.name]?.[spec]?.girls || ''}
                      onChange={(e) =>
                        handleInputChange(degree.name, spec, 'girls', Number(e.target.value))
                      }
                      onKeyDown={handleKeyDown} // Prevent invalid characters
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => handleGenerate(degree.name)}
            className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
          >
            Generate
          </button>
        </div>
      ))}
      <Footer />
    </div>
  );
}
