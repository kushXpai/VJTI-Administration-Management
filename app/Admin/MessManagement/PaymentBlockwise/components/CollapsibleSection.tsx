"use client";

import { useState, ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  colorClass?: string; // For background gradient etc.
  defaultOpen?: boolean;
}

export default function CollapsibleSection({
  title,
  subtitle,
  children,
  colorClass = "bg-gray-800", // default dark background
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl mb-4 shadow-lg border">
      <div
        className={`flex justify-between items-center p-4 text-white cursor-pointer ${colorClass}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="font-semibold text-lg">{title}</div>
        <div className="flex items-center gap-4">
          {subtitle && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
              {subtitle}
            </span>
          )}
          <span className="text-2xl font-bold">
            {isOpen ? "−" : "+"}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="bg-white p-4 border-t">{children}</div>
      )}
    </div>
  );
}
