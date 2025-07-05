'use client';

import { useState } from 'react';
import { Student } from '../types/studentTypes';
import { generateIDCardPDF } from '../utils/pdfUtils';
import { formatCourseFileName, uiToDbCourseMap } from '../utils/courseData';

interface StudentListProps {
  students: Student[];
  specialization: string;
}

export default function StudentList({ students, specialization }: StudentListProps) {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);

    const selected = students.filter(s => selectedStudents.includes(s.id));
    if (selected.length === 0) {
      setGenerating(false);
      return;
    }

    // Detect stream (B.Tech / M.Tech / Diploma / MCA) from course
    const dbCourse = selected[0]?.course;
    let stream: string | undefined;

    for (const [key, specMap] of Object.entries(uiToDbCourseMap)) {
      for (const val of Object.values(specMap)) {
        if (val === dbCourse) {
          stream = key;
          break;
        }
      }
      if (stream) break;
    }

    const year = new Date().getFullYear();
    const fileName = formatCourseFileName(stream ?? 'unknown', specialization, year);

    const pdfBytes = await generateIDCardPDF(selected);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    setGenerating(false);
  };

  const toggleSelect = (id: number) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      const allIds = students.map(s => s.id);
      setSelectedStudents(allIds);
    }
  };

  if (students.length === 0) {
    return <p className="text-gray-600">No students found for this specialization.</p>;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleSelectAll}
          className="bg-[#800000] text-white px-4 py-2 rounded hover:bg-[#990000] transition-colors"
        >
          {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
        </button>

        <button
          onClick={handleGenerate}
          disabled={generating || selectedStudents.length === 0}
          className="bg-[#800000] text-white px-4 py-2 rounded hover:bg-[#990000] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {generating ? 'Generating...' : 'Download Selected'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {students.map(student => (
          <label
            key={student.id}
            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
          >
            <input
              type="checkbox"
              checked={selectedStudents.includes(student.id)}
              onChange={() => toggleSelect(student.id)}
              className="w-4 h-4 text-[#800000] focus:ring-[#800000]"
            />
            <span className="flex-1">
              <span className="font-medium">{student.student_name}</span>
              <span className="text-gray-600 ml-2">{student.course}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
