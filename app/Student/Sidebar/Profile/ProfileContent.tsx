// app/Student/Sidebar/Profile/ProfileContent.tsx

'use client';

import { useState } from 'react';
import Image from 'next/image';

interface User {
  name: string;
  email: string;
  id: string;
  role: string;
  department?: string;
  year?: string;
}

interface HostelData {
  id: string;
  date_of_birth?: string;
  gender?: string;
  mobile_number?: string;
  father_name?: string;
  father_mobile?: string;
  mother_name?: string;
  mother_mobile?: string;
  guardian_name?: string;
  guardian_mobile?: string;
  present_address_line1?: string;
  present_address_line2?: string;
  present_state?: string;
  present_city?: string;
  present_pin_code?: string;
  permanent_address_line1?: string;
  permanent_address_line2?: string;
  permanent_state?: string;
  permanent_city?: string;
  permanent_pin_code?: string;
  cet_application_id?: string;
  cet_rank?: number;
  course?: string;
  category?: string;
  is_pwd?: boolean;
  pwd_details?: string;
  is_ews?: boolean;
  is_religious_minority?: boolean;
  religious_minority_details?: string;
  photo_url?: string;
  aadhar_card_number?: string;
  hostel_application_status?: string;
  allotment_status?: string;
  building_name?: string;
  room_number?: string;
  hostel_allotment_status?: string;
}

interface ProfileProps {
  user: User;
  hostelData?: HostelData;
}

export default function ProfileContent({ user, hostelData }: ProfileProps) {
  const [activeTab, setActiveTab] = useState('basic');

  // Add these debug logs right at the start
  console.log('=== PROFILE CONTENT DEBUG ===');
  console.log('User received:', user);
  console.log('Hostel data received:', hostelData);
  console.log('Hostel data keys:', hostelData ? Object.keys(hostelData) : 'No hostel data');
  
  // Check specific fields
  if (hostelData) {
    console.log('Date of birth:', hostelData.date_of_birth);
    console.log('Gender:', hostelData.gender);
    console.log('Mobile:', hostelData.mobile_number);
    console.log('Course:', hostelData.course);
  }

  if (!user) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-600">Loading user data...</div>
    </div>
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            <div className="relative">
              {hostelData?.photo_url ? (
                <Image
                  src={hostelData.photo_url}
                  alt={user.name}
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover border-4 border-red-700 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-red-700 flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-bold text-white">✓</span>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
            <p className="text-lg text-gray-600 mb-2">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              <span className="px-3 py-1 bg-red-700 text-white text-sm rounded-full font-medium">
                {user.role || 'Student'}
              </span>
              {hostelData?.course && (
                <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                  {hostelData.course}
                </span>
              )}
              {hostelData?.cet_rank && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  CET Rank: {hostelData.cet_rank}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'basic', label: 'Basic Information', icon: '👤' },
              { id: 'academic', label: 'Academic Details', icon: '🎓' },
              { id: 'family', label: 'Family Details', icon: '👨‍👩‍👧‍👦' },
              { id: 'address', label: 'Address Information', icon: '🏠' },
              { id: 'hostel', label: 'Hostel Status', icon: '🏢' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-700 text-red-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Student ID</label>
                  <p className="mt-1 text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">
                    {user.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="mt-1 text-gray-900">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                  <p className="mt-1 text-gray-900">{formatDate(hostelData?.date_of_birth)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Gender</label>
                  <p className="mt-1 text-gray-900">{hostelData?.gender || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Mobile Number</label>
                  <p className="mt-1 text-gray-900">{hostelData?.mobile_number || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Course</label>
                  <p className="mt-1 text-gray-900">{hostelData?.course || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">CET Application ID</label>
                  <p className="mt-1 text-gray-900 font-mono text-sm">
                    {hostelData?.cet_application_id || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">CET Rank</label>
                  <p className="mt-1 text-gray-900">{hostelData?.cet_rank || 'Not provided'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="mt-1 text-gray-900">{hostelData?.category || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">PWD Status</label>
                  <p className="mt-1 text-gray-900">
                    {hostelData?.is_pwd ? 'Yes' : 'No'}
                    {hostelData?.pwd_details && (
                      <span className="block text-sm text-gray-600 mt-1">
                        Details: {hostelData.pwd_details}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">EWS Status</label>
                  <p className="mt-1 text-gray-900">{hostelData?.is_ews ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'family' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Father&apos;s Information</h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="mt-1 text-gray-900">{hostelData?.father_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Mobile</label>
                  <p className="mt-1 text-gray-900">{hostelData?.father_mobile || 'Not provided'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Mother&apos;s Information</h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="mt-1 text-gray-900">{hostelData?.mother_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Mobile</label>
                  <p className="mt-1 text-gray-900">{hostelData?.mother_mobile || 'Not provided'}</p>
                </div>
              </div>
            </div>
            {(hostelData?.guardian_name || hostelData?.guardian_mobile) && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium text-gray-900 mb-4">Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="mt-1 text-gray-900">{hostelData?.guardian_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Mobile</label>
                    <p className="mt-1 text-gray-900">{hostelData?.guardian_mobile || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'address' && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Present Address</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address Line 1</label>
                    <p className="mt-1 text-gray-900">{hostelData?.present_address_line1 || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address Line 2</label>
                    <p className="mt-1 text-gray-900">{hostelData?.present_address_line2 || 'Not provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">City</label>
                      <p className="mt-1 text-gray-900">{hostelData?.present_city || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">State</label>
                      <p className="mt-1 text-gray-900">{hostelData?.present_state || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">PIN Code</label>
                    <p className="mt-1 text-gray-900">{hostelData?.present_pin_code || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Permanent Address</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address Line 1</label>
                    <p className="mt-1 text-gray-900">{hostelData?.permanent_address_line1 || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address Line 2</label>
                    <p className="mt-1 text-gray-900">{hostelData?.permanent_address_line2 || 'Not provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">City</label>
                      <p className="mt-1 text-gray-900">{hostelData?.permanent_city || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">State</label>
                      <p className="mt-1 text-gray-900">{hostelData?.permanent_state || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">PIN Code</label>
                    <p className="mt-1 text-gray-900">{hostelData?.permanent_pin_code || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hostel' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hostel Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Application Status</h3>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(hostelData?.hostel_application_status)}`}>
                  {hostelData?.hostel_application_status || 'Not Applied'}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Allotment Status</h3>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(hostelData?.allotment_status)}`}>
                  {hostelData?.allotment_status || 'Pending'}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Final Status</h3>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(hostelData?.hostel_allotment_status)}`}>
                  {hostelData?.hostel_allotment_status || 'Pending'}
                </span>
              </div>
            </div>

            {(hostelData?.building_name || hostelData?.room_number) && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-3">🏢 Hostel Allotment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-green-700">Building Name</label>
                    <p className="mt-1 text-green-900">{hostelData?.building_name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-green-700">Room Number</label>
                    <p className="mt-1 text-green-900">{hostelData?.room_number || 'Not assigned'}</p>
                  </div>
                </div>
              </div>
            )}

            {hostelData?.aadhar_card_number && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3">📄 Document Information</h3>
                <div>
                  <label className="text-sm font-medium text-blue-700">Aadhar Card Number</label>
                  <p className="mt-1 text-blue-900 font-mono">
                    {hostelData.aadhar_card_number.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {/* <div className="mt-6 flex justify-end space-x-4">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Download Profile
        </button>
        <button className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors">
          Edit Profile
        </button>
      </div> */}
    </div>
  );
}