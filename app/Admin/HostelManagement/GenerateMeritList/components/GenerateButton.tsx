// components/GenerateButton.tsx

import React from 'react';
import Loader from './Loader';

interface GenerateButtonProps {
  isLoading: boolean;
  onClick: () => void;
  text?: string;
  loadingText?: string;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  isLoading,
  onClick,
  text = 'Generate',
  loadingText = 'Processing...'
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`${
        isLoading ? 'bg-gray-500' : 'bg-red-700 hover:bg-red-800'
      } text-white px-4 py-2 rounded flex items-center`}
    >
      {isLoading ? <Loader text={loadingText} /> : text}
    </button>
  );
};

export default GenerateButton;