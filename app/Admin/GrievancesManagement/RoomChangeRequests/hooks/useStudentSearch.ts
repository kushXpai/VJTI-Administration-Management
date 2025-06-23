import { useState, useCallback } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { StudentResult, Room } from '../types';

const useStudentSearch = () => {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapLoading, setSwapLoading] = useState(false);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Helper function to update occupants_list in rooms table
  const updateRoomOccupants = useCallback(async (buildingName: string, roomNumber: string) => {
    try {
      // Fetch current occupants directly from hostel_applications
      const { data: occupants, error: fetchError } = await supabase
        .from('hostel_applications')
        .select('id')
        .eq('building_name', buildingName)
        .eq('room_number', roomNumber)
        .eq('hostel_allotment_status', 'Accepted');
      if (fetchError) {
        console.error('Fetch occupants error:', fetchError);
        throw fetchError;
      }

      // Map to get IDs as text
      const occupantsList = (occupants || []).map((item: { id: string }) => item.id).filter(Boolean);

      // Update rooms table
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ occupants_list: occupantsList })
        .eq('building_name', buildingName)
        .eq('room_number', roomNumber);
      if (updateError) {
        console.error('Update rooms error:', updateError);
        throw updateError;
      }

      console.log(`Updated occupants_list for ${buildingName}-${roomNumber}:`, occupantsList);
      return occupantsList;
    } catch (err: any) {
      console.error(`Failed to update occupants for ${buildingName}-${roomNumber}:`, err.message);
      throw err;
    }
  }, []);

  const searchStudents = useCallback(async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('search_accepted_students', { search_term: term });
      if (error) throw error;
      const formattedData = (data || []).map((item: { id: any; name: any; cet_application_id: any; course: any; gender: any; mobile_number: any; room_number: any; building_name: any; hostel_allotment_status: any; }) => ({
        id: item.id,
        name: item.name || '',
        cet_application_id: item.cet_application_id || '',
        course: item.course || '',
        gender: item.gender || '',
        mobile_number: item.mobile_number || '',
        room_number: item.room_number,
        building_name: item.building_name,
        hostel_allotment_status: item.hostel_allotment_status,
      }));
      setResults(formattedData);
      console.log('searchStudents set results:', formattedData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStudentRoom = useCallback(async (studentId: string, roomNumber: string, buildingName: string) => {
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      // Fetch current room assignment
      const { data: current, error: fetchError } = await supabase
        .from('hostel_applications')
        .select('room_number, building_name')
        .eq('id', studentId)
        .single();
      if (fetchError) throw fetchError;

      const oldRoom = current?.room_number;
      const oldBuilding = current?.building_name;

      // Update hostel_applications
      const { error: updateError } = await supabase
        .from('hostel_applications')
        .update({ room_number: roomNumber, building_name: buildingName })
        .eq('id', studentId);
      if (updateError) throw updateError;

      // Update rooms table for old room (if exists)
      if (oldRoom && oldBuilding) {
        await updateRoomOccupants(oldBuilding, oldRoom);
      }

      // Update rooms table for new room
      await updateRoomOccupants(buildingName, roomNumber);

      // Update local state
      setResults((prev) =>
        prev.map((student) =>
          student.id === studentId ? { ...student, room_number: roomNumber, building_name: buildingName } : student
        )
      );

      return true;
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update room.');
      return false;
    } finally {
      setUpdateLoading(false);
    }
  }, [updateRoomOccupants]);

  const swapStudentRooms = useCallback(async (student1Id: string, student2Id: string) => {
    setSwapLoading(true);
    setSwapError(null);
    try {
      // Fetch current room details from accepted_hostel_allocations
      const { data: students, error: fetchError } = await supabase
        .from('accepted_hostel_allocations')
        .select('id, room_number, building_name')
        .in('id', [student1Id, student2Id]);
      if (fetchError) throw fetchError;
      if (!students || students.length !== 2) throw new Error('Students not found.');

      const student1 = students.find((s) => s.id === student1Id);
      const student2 = students.find((s) => s.id === student2Id);
      if (!student1 || !student2) throw new Error('Invalid student data.');

      console.log('Swapping rooms:', {
        student1Id,
        student1Room: student1.room_number,
        student1Building: student1.building_name,
        student2Id,
        student2Room: student2.room_number,
        student2Building: student2.building_name,
      });

      // Update student1 with student2's room details in hostel_applications
      const { error: update1Error } = await supabase
        .from('hostel_applications')
        .update({
          room_number: student2.room_number || null,
          building_name: student2.building_name || null,
        })
        .eq('id', student1Id);
      if (update1Error) throw update1Error;

      // Update student2 with student1's room details in hostel_applications
      const { error: update2Error } = await supabase
        .from('hostel_applications')
        .update({
          room_number: student1.room_number || null,
          building_name: student1.building_name || null,
        })
        .eq('id', student2Id);
      if (update2Error) throw update2Error;

      // Update rooms table for both rooms
      if (student1.room_number && student1.building_name) {
        await updateRoomOccupants(student1.building_name, student1.room_number);
      }
      if (student2.room_number && student2.building_name) {
        await updateRoomOccupants(student2.building_name, student2.room_number);
      }

      // Update local state
      setResults((prev) =>
        prev.map((student) => {
          if (student.id === student1Id) {
            return { ...student, room_number: student2.room_number, building_name: student2.building_name };
          }
          if (student.id === student2Id) {
            return { ...student, room_number: student1.room_number, building_name: student1.building_name };
          }
          return student;
        })
      );

      console.log('Swap successful:', { student1Id, student2Id });
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to swap rooms.';
      setSwapError(errorMessage);
      console.error('Swap error:', errorMessage);
      return false;
    } finally {
      setSwapLoading(false);
    }
  }, [updateRoomOccupants]);

  const fetchBuildings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('accepted_hostel_allocations')
        .select('building_name')
        .not('building_name', 'is', null)
        .order('building_name');
      if (error) throw error;
      const uniqueBuildings = [...new Set(data.map((b) => b.building_name))];
      setBuildings(uniqueBuildings);
      console.log('Fetched buildings:', uniqueBuildings);
    } catch (err: any) {
      console.error('Failed to fetch buildings:', err.message);
      setError(err.message || 'Failed to fetch buildings.');
    }
  }, []);

  const fetchRooms = useCallback(async (buildingName: string) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('room_number, capacity, vacant, occupants, occupants_list, type, floor')
        .eq('building_name', buildingName)
        .order('room_number');
      if (error) throw error;
      const formattedRooms = (data || []).map((room, index) => ({
        id: `${buildingName}-${room.room_number}-${index}`,
        room_number: room.room_number,
        building_name: buildingName,
        capacity: room.capacity || 0,
        vacant: room.vacant || 0,
        occupants: room.occupants || 0,
        occupants_list: room.occupants_list || [],
        type: room.type || 'default',
        floor: room.floor || 0, 
      }));
      setRooms(formattedRooms);
      console.log('Fetched rooms:', formattedRooms);
    } catch (err: any) {
      console.error('Failed to fetch rooms:', err.message);
      setError(err.message || 'Failed to fetch rooms.');
    }
  }, []);

  return {
    results,
    error,
    loading,
    searchStudents,
    updateStudentRoom,
    updateError,
    updateLoading,
    swapStudentRooms,
    swapError,
    swapLoading,
    buildings,
    rooms,
    fetchBuildings,
    fetchRooms,
  };
};

export default useStudentSearch;