// components/PDFViewButtons.tsx

import React from 'react';

interface PDFViewButtonsProps {
  degree: string;
  pdfUrls: Record<string, string>;
}

export function PDFViewButtons({ degree, pdfUrls }: PDFViewButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {['Boys', 'Girls'].map((gender) => {
        const url = pdfUrls[`${degree}_${gender}`];
        return (
          <a
            key={gender}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              inline-flex items-center px-4 py-2 rounded-md text-sm font-medium
              transition-all duration-200 ease-in-out
              ${url
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              sm:text-base
            `}
            onClick={(e) => {
              if (!url) {
                e.preventDefault();
              }
            }}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View {gender} List
          </a>
        );
      })}
    </div>
  );
}