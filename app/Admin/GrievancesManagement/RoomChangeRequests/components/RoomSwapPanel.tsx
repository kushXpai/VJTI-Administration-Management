// components/RoomSwapPanel.tsx

import React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { Student } from '../types';

interface RoomSwapPanelProps {
  student1: Student | null;
  student2: Student | null;
  onSetStudent1: (student: Student | null) => void;
  onSetStudent2: (student: Student | null) => void;
  onSwapRooms: (student1Id: string, student2Id: string) => Promise<boolean>;
  loading: boolean;
}

const RoomSwapPanel: React.FC<RoomSwapPanelProps> = ({
  student1,
  student2,
  onSetStudent1,
  onSetStudent2,
  onSwapRooms,
  loading
}) => {
  const handleSwap = async () => {
    if (!student1 || !student2) return;

    const success = await onSwapRooms(student1.id, student2.id);
    
    if (success) {
      onSetStudent1(null);
      onSetStudent2(null);
    }
  };

  const canSwap = student1 && student2 && student1.id !== student2.id;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          Select two students from the search results to swap their room assignments.
        </p>
      </div>

      {/* Student Selection Areas */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Student 1 */}
        <div className={`border-2 border-dashed rounded-lg p-6 ${
          student1 ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
        }`}>
          <h3 className="text-lg font-semibold mb-4">Student 1</h3>
          {student1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {student1.name}</p>
                <p><span className="font-medium">Current Room:</span> {student1.building_name} - {student1.room_number}</p>
                <p><span className="font-medium">Course:</span> {student1.course}</p>
              </div>
              <button
                onClick={() => onSetStudent1(null)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                Remove
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <p>Select first student from search results</p>
            </div>
          )}
        </div>

        {/* Student 2 */}
        <div className={`border-2 border-dashed rounded-lg p-6 ${
          student2 ? 'border-green-300 bg-green-50' : 'border-gray-300'
        }`}>
          <h3 className="text-lg font-semibold mb-4">Student 2</h3>
          {student2 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {student2.name}</p>
                <p><span className="font-medium">Current Room:</span> {student2.building_name} - {student2.room_number}</p>
                <p><span className="font-medium">Course:</span> {student2.course}</p>
              </div>
              <button
                onClick={() => onSetStudent2(null)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                Remove
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <p>Select second student from search results</p>
            </div>
          )}
        </div>
      </div>

      {/* Swap Preview */}
      {canSwap && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Room Swap Preview
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-yellow-900">{student1.name}</p>
              <p className="text-yellow-800">
                Current: {student1.building_name} - {student1.room_number}
              </p>
              <p className="text-yellow-800">
                → Will move to: {student2.building_name} - {student2.room_number}
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-yellow-900">{student2.name}</p>
              <p className="text-yellow-800">
                Current: {student2.building_name} - {student2.room_number}
              </p>
              <p className="text-yellow-800">
                → Will move to: {student1.building_name} - {student1.room_number}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Swap Button */}
      {canSwap && (
        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            disabled={loading}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            {loading ? 'Swapping Rooms...' : 'Confirm Room Swap'}
          </button>
        </div>
      )}

      {/* Help Text */}
      {!student1 && !student2 && (
        <div className="text-center py-8 text-gray-500">
          <p>Use the search above to find and select two students for room swapping</p>
        </div>
      )}
    </div>
  );
};

export default RoomSwapPanel;