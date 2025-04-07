// app/Student/StudentDashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiHome, FiCoffee, FiAlertCircle, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';

// Import modular components
import ProfileContent from '../Sidebar/Profile/page';
import HostelContent from '../Sidebar/Hostel/page';
import GrievancesContent from '../Sidebar/Grievances/page';
import MessContent from '../Sidebar/Mess/page';
import DashboardContent from '../Sidebar/Dashboard/page';

// Define the User type
interface User {
  name: string;
  email: string;
  id: string;
  role: string;
  department: string;
  year: string;
  profileImage: string;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      setLoading(false);
    } else {
      setUser({
        name: "Kush Pai",
        email: "kushpaipla@gmail.com",
        id: "c4480662-38f8-42b0-8dd5-de111270855f",
        role: "student",
        department: "Computer Engineering",
        year: "Third Year",
        profileImage: "/images/profile-placeholder.jpg" // Placeholder image path
      });
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    setLogoutLoading(true);
    localStorage.removeItem('user');
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  // Render the appropriate content based on active page
  const renderContent = () => {
    switch (activePage) {
      case 'Dashboard':
        return <DashboardContent user={user!} />;
      case 'Hostel Allocation':
        return <HostelContent user={user!} />;
      case 'Grievances':
        return <GrievancesContent />;
      case 'Mess Management':
        return <MessContent />;
      case 'Profile':
        return <ProfileContent user={user!} />;
      default:
        return <DashboardContent user={user!} />;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-red-800 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 fixed w-full z-10 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <div className="flex items-center">
              <div className="bg-red-900 h-8 w-8 rounded-md flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <h1 className="text-red-900 font-bold text-lg hidden sm:block">VJTI Hostel Portal</h1>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <FiUser size={18} className="text-red-900" />
                )}
              </div>
              <span className="ml-2 text-sm font-medium hidden md:block">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16 flex-1">
        {/* Sidebar */}
        <aside
          className={`bg-white shadow-md fixed h-full z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'
            }`}
        >
          <div className="h-full flex flex-col overflow-y-auto">
            {/* Navigation Menu */}
            <nav className="p-4 flex-1">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActivePage('Dashboard')}
                    className={`flex items-center px-4 py-3 rounded-xl w-full text-left ${activePage === 'Dashboard'
                        ? 'bg-red-50 text-red-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <FiHome size={18} className={isSidebarOpen ? 'mr-3' : ''} />
                    {(isSidebarOpen || window.innerWidth >= 1024) && <span className={!isSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : ''}>Dashboard</span>}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePage('Hostel Allocation')}
                    className={`flex items-center px-4 py-3 rounded-xl w-full text-left ${activePage === 'Hostel Allocation'
                        ? 'bg-red-50 text-red-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <FaBuilding size={18} className={isSidebarOpen ? 'mr-3' : ''} />
                    {(isSidebarOpen || window.innerWidth >= 1024) && <span className={!isSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : ''}>Hostel Allocation</span>}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePage('Mess Management')}
                    className={`flex items-center px-4 py-3 rounded-xl w-full text-left ${activePage === 'Mess Management'
                        ? 'bg-red-50 text-red-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <FiCoffee size={18} className={isSidebarOpen ? 'mr-3' : ''} />
                    {(isSidebarOpen || window.innerWidth >= 1024) && <span className={!isSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : ''}>Mess Management</span>}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePage('Grievances')}
                    className={`flex items-center px-4 py-3 rounded-xl w-full text-left ${activePage === 'Grievances'
                        ? 'bg-red-50 text-red-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <FiAlertCircle size={18} className={isSidebarOpen ? 'mr-3' : ''} />
                    {(isSidebarOpen || window.innerWidth >= 1024) && <span className={!isSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : ''}>Grievances</span>}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePage('Profile')}
                    className={`flex items-center px-4 py-3 rounded-xl w-full text-left ${activePage === 'Profile'
                        ? 'bg-red-50 text-red-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <FiUser size={18} className={isSidebarOpen ? 'mr-3' : ''} />
                    {(isSidebarOpen || window.innerWidth >= 1024) && <span className={!isSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : ''}>Profile</span>}
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="flex items-center px-4 py-3 rounded-xl w-full text-left text-gray-600 hover:bg-gray-100 hover:text-red-700"
                  >
                    <FiLogOut size={18} className={isSidebarOpen ? 'mr-3' : ''} />
                    {(isSidebarOpen || window.innerWidth >= 1024) && <span className={!isSidebarOpen && window.innerWidth >= 1024 ? 'hidden' : ''}>{logoutLoading ? 'Logging out...' : 'Logout'}</span>}
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 p-6 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0 lg:ml-20'
          }`}>
          {/* Page title and date */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{activePage}</h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Content */}
          <div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}