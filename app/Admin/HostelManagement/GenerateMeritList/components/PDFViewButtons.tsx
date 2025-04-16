// components/PDFViewButtons.tsx

import React from 'react';

interface PDFViewButtonsProps {
  boysPdfUrl?: string;
  girlsPdfUrl?: string;
  handleViewPDF: (url: string) => void;
}

const PDFViewButtons: React.FC<PDFViewButtonsProps> = ({ boysPdfUrl, girlsPdfUrl, handleViewPDF }) => {
  return (
    <div className="space-x-2">
      {boysPdfUrl && (
        <button
          onClick={() => handleViewPDF(boysPdfUrl)}
          className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
        >
          Boys List
        </button>
      )}
      {girlsPdfUrl && (
        <button
          onClick={() => handleViewPDF(girlsPdfUrl)}
          className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
        >
          Girls List
        </button>
      )}
    </div>
  );
};

export default PDFViewButtons;