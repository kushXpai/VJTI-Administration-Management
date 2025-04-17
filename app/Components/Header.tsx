import Image from 'next/image';
import { ReactNode } from 'react';

interface HeaderProps {
  rightContent?: ReactNode;
}

export default function Header({ rightContent }: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-center p-2 sm:p-4 border-b border-gray-300 bg-white shadow">
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto mb-2 sm:mb-0">
        <div className="relative w-10 h-10 sm:w-[50px] sm:h-[50px]">
          <Image src="/images/vjti_logo.svg" alt="VJTI Logo" fill className="object-contain" />
        </div>
        <div>
          <h1 className="text-base sm:text-xl font-bold text-[#800000] line-clamp-1">Veermata Jijabai Technological Institute</h1>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">Matunga East, Mumbai, Maharashtra 400019</p>
        </div>
      </div>
      <div className="w-full sm:w-auto">{rightContent}</div>
    </header>
  );
}

{/* For a Page with Logout
    <Header
  rightContent={
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium">Welcome, Admin</span>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded"
      >
        Logout
      </button>
    </div>
  }
/> */}

{/* For a Page without Logout, Merit Page example
    <Header
  rightContent={
    <div className="flex flex-col">
      <h1 className="text-xl font-bold tracking-tight text-[#800000]">Hostel Merit List</h1>
      <p className="text-sm text-gray-600">Admin Management Panel</p>
    </div>
  }
/> */}