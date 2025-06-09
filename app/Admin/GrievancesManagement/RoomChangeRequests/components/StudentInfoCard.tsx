// components/StudentInfoCard.tsx

import React from 'react';
import { User, Hash, Building, BookOpen, X } from 'lucide-react';
import { Student } from '../types';

interface StudentInfoCardProps {
  student: Student;
  onSelect?: () => void;
  onRemove?: () => void;
  showSelectButton?: boolean;
  showRemoveButton?: boolean;
  variant?: 'default' | 'selected' | 'swap';
  title?: string;
}

const StudentInfoCard: React.FC<StudentInfoCardProps> = ({
  student,
  onSelect,
  onRemove,
  showSelectButton = false,
  showRemoveButton = false,
  variant = 'default',
  title
}) => {
  const getCardClasses = () => {
    const baseClasses = "rounded-lg border transition-shadow";
    
    switch (variant) {
      case 'selected':
        return `${baseClasses} bg-blue-50 border-blue-200 p-6`;
      case 'swap':
        return `${baseClasses} border-2 border-dashed p-6`;
      default:
        return `${baseClasses} bg-white p-4 hover:shadow-md border-gray-200`;
    }
  };

  const getTitleClasses = () => {
    switch (variant) {
      case 'selected':
        return 'text-lg font-semibold text-blue-900 mb-4';
      case 'swap':
        return 'text-lg font-semibold mb-4';
      default:
        return '';
    }
  };

  const getInfoClasses = () => {
    switch (variant) {
      case 'selected':
        return 'text-sm text-blue-600';
      default:
        return 'text-sm text-gray-500';
    }
  };

  const getValueClasses = () => {
    switch (variant) {
      case 'selected':
        return 'font-medium text-blue-900';
      default:
        return 'font-medium';
    }
  };

  return (
    <div className={getCardClasses()}>
      {title && <h3 className={getTitleClasses()}>{title}</h3>}
      
      <div className="flex justify-between items-start">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <div>
              <p className={getInfoClasses()}>Name</p>
              <p className={getValueClasses()}>{student.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-500" />
            <div>
              <p className={getInfoClasses()}>ID</p>
              <p className={getValueClasses()} title={student.id}>
                {student.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-gray-500" />
            <div>
              <p className={getInfoClasses()}>Room</p>
              <p className={getValueClasses()}>
                {student.building_name} - {student.room_number}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <div>
              <p className={getInfoClasses()}>Course</p>
              <p className={getValueClasses()}>{student.course}</p>
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex gap-2">
          {showSelectButton && onSelect && (
            <button
              onClick={onSelect}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Select
            </button>
          )}
          
          {showRemoveButton && onRemove && (
            <button
              onClick={onRemove}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
              <X className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentInfoCard;