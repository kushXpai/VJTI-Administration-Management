'use client';

import { StudentResult } from '../types';

interface SwapButtonsProps {
  selectedStudents: StudentResult[];
  onSwapClick: () => void;
  onClearSelections: () => void;
}

const SwapButtons = ({ selectedStudents, onSwapClick, onClearSelections }: SwapButtonsProps) => {
  return (
    <div className="mt-4 flex gap-2">
      <button
        onClick={onSwapClick}
        className="px-4 py-2 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701] disabled:bg-gray-400"
        disabled={selectedStudents.length !== 2}
      >
        Swap Rooms
      </button>
      <button
        onClick={onClearSelections}
        className="px-4 py-2 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701]"
        disabled={selectedStudents.length === 0}
      >
        Clear Selections
      </button>
    </div>
  );
};

export { SwapButtons };