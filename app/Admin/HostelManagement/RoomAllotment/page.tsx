'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import Header from '@/app/Components/Header';
import Footer from '@/app/Components/Footer';
import { StudentApplication, Room, Hostel, Mess } from './Types/Type';
import StudentList from './Components/StudentList';
import ManualAutoRoomAllocation from './Components/ManualAutoRoomAllocation';
import AllocatedStudentList from './Components/AllocatedStudentList';
import { autoAllocateRooms } from './utils/autoAllocateRooms';

export default function RoomAllotmentPage() {
  const [pendingStudents, setPendingStudents] = useState<StudentApplication[]>([]);
  const [allStudents, setAllStudents] = useState<StudentApplication[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [messes, setMesses] = useState<Mess[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<string>('All');

  const fetchAllData = async () => {
    setLoading(true);

    const [pendingRes, allRes, roomsRes, hostelsRes, messesRes] = await Promise.all([
      supabase
        .from('hostel_applications_db')
        .select(`*, profiles_db!hostel_applications_db_student_id_fkey(name)`)
        .eq('hostel_applications_status', 'Accepted')
        .eq('provisional_status', 'Accepted')
        .eq('block_allotment_status', 'Pending'),

      supabase
        .from('hostel_applications_db')
        .select(`*, profiles_db!hostel_applications_db_student_id_fkey(name)`),

      supabase.from('room_db').select('*'),
      supabase.from('hostel_db').select('*'),
      supabase.from('mess_db').select('*'),
    ]);

    const rawPending = (pendingRes.data || []) as any[];
    const typedPending: StudentApplication[] = rawPending.map((s) => ({
      ...s,
      profiles_db: s.profiles_db ? [s.profiles_db] : [],
    }));

    const rawAll = (allRes.data || []) as any[];
    const typedAll: StudentApplication[] = rawAll.map((s) => ({
      ...s,
      profiles_db: s.profiles_db ? [s.profiles_db] : [],
    }));

    setPendingStudents(typedPending);
    setAllStudents(typedAll);
    setRooms((roomsRes.data || []) as Room[]);
    setHostels((hostelsRes.data || []) as Hostel[]);
    setMesses((messesRes.data || []) as Mess[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleManualAllocate = async () => {
    await fetchAllData();
    setSelectedStudentId(null);
    setSelectedRoomId(null);
  };

  const handleAutoAllocate = async () => {
    setLoading(true);
    await autoAllocateRooms(pendingStudents, rooms, hostels, messes, fetchAllData);
    await fetchAllData();
    setLoading(false);
  };

  const handleCancel = () => {
    setSelectedStudentId(null);
    setSelectedRoomId(null);
  };

  return (
    <div className="p-6">
      <Header
        rightContent={
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-[#800000]">
              Hostel Room Allocation
            </h1>
            <p className="text-sm text-gray-600">Admin Management Panel</p>
          </div>
        }
      />

      <h1 className="text-2xl font-bold text-[#800000] mb-6">Room Allotment</h1>

      {/* Pending Student List */}
      <StudentList
        students={pendingStudents}
        onSelectStudent={(id) => setSelectedStudentId(id)}
        loading={loading}
        selectedCourse={selectedCourse}
        onCourseSelect={setSelectedCourse}
      />

      {/* Manual & Auto Allocation */}
      <ManualAutoRoomAllocation
        students={pendingStudents}
        rooms={rooms}
        hostels={hostels}
        messes={messes}
        selectedStudentId={selectedStudentId}
        selectedRoomId={selectedRoomId}
        loading={loading}
        onSelectStudent={(id) => setSelectedStudentId(id)}
        onSelectRoom={(id) => setSelectedRoomId(id)}
        onAllocateManually={handleManualAllocate}
        onAutoAllocate={handleAutoAllocate}
        onCancel={handleCancel}
      />

      {/* Allocated Student List */}
      <AllocatedStudentList
        students={allStudents}
        hostels={hostels}
        messes={messes}
        selectedCourse={selectedCourse}
        onCourseSelect={setSelectedCourse}
        selectedGender={selectedGender}
        onGenderChange={setSelectedGender}
      />

      <Footer />
    </div>
  );
}
