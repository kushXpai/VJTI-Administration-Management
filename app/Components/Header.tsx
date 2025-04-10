import Image from 'next/image';
import { ReactNode } from 'react';

interface HeaderProps {
  rightContent?: ReactNode; // Custom content for the right-hand side
}

export default function Header({ rightContent }: HeaderProps) {
  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-300 bg-white shadow">
      <div className="flex items-center gap-4">
        <Image src="/images/vjti_logo.svg" alt="VJTI Logo" width={50} height={50} />
        <div>
          <h1 className="text-xl font-bold text-[#800000]">Veermata Jijabai Technological Institute</h1>
          <p className="text-sm text-gray-600">Matunga East, Mumbai, Maharashtra 400019</p>
        </div>
      </div>
      <div>{rightContent}</div> {/* Render custom content here */}
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