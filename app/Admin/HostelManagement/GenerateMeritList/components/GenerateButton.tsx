// components/GenerateButton.tsx

import React from 'react';
import Loader from './Loader';

interface GenerateButtonProps {
  degree: string;
  loading: Record<string, boolean>;
  onClick: () => void;
  disabled?: boolean;
}

export function GenerateButton({ degree, loading, onClick, disabled }: GenerateButtonProps) {
  const isLoading = loading[degree];
  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center px-4 py-2 rounded-md text-sm font-medium
        transition-all duration-200 ease-in-out
        ${isDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-[#800000] text-white hover:bg-[#600000] active:bg-[#400000]'
        }
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800000]
        sm:text-base
      `}
    >
      {isLoading ? (
        <>
          <Loader className="w-4 h-4 mr-2" />
          <span>Generating...</span>
        </>
      ) : (
        <span>Generate Merit List</span>
      )}
    </button>
  );
}