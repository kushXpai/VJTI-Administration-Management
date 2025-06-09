import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { Building, Floor } from '../types';

export const useFloors = (selectedBlock: number | null, buildings: Building[]) => {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset floors when selectedBlock changes
    setFloors([]);

    async function fetchFloors() {
      if (!selectedBlock) return;

      setIsLoading(true);
      try {
        const selectedBuilding = buildings.find((b) => b.id === selectedBlock);
        if (!selectedBuilding) throw new Error('Building not found');

        // Fetch distinct floors to verify
        const { data: floorData, error: floorError } = await supabase
          .from('rooms')
          .select('floor')
          .eq('building_name', selectedBuilding.name)
          .order('floor');

        if (floorError) throw floorError;

        const uniqueFloors = Array.from(new Set(floorData?.map((item) => item.floor) || []));
        console.log(`Unique floors for ${selectedBuilding.name}:`, uniqueFloors);

        if (uniqueFloors.length === 0) {
          setFloors([]);
          return;
        }

        // Fetch all rooms for the building
        const { data: roomsData, error: roomsError } = await supabase
          .from('rooms')
          .select('*')
          .eq('building_name', selectedBuilding.name)
          .in('floor', uniqueFloors)
          .order('floor, room_number');

        if (roomsError) throw roomsError;
        console.log(`Rooms fetched for ${selectedBuilding.name}:`, roomsData);

        if (!roomsData || roomsData.length === 0) {
          setFloors([]);
          return;
        }

        // Group rooms by floor
        const floorMap = new Map<number, Floor>();
        for (const room of roomsData) {
          const floorNumber = room.floor;
          if (!floorMap.has(floorNumber)) {
            floorMap.set(floorNumber, {
              id: floorNumber,
              blockId: selectedBlock,
              name: `Floor ${floorNumber}`,
              roomCount: 0,
              rooms: [],
            });
          }
        }

        // Process rooms and fetch student details
        for (const room of roomsData) {
          const floor = floorMap.get(room.floor)!;
          const studentIds: string[] = Array.isArray(room.occupants_list)
            ? room.occupants_list
            : [];

          let students: { id: string; name: string; course: string }[] = [];
          if (studentIds.length > 0) {
            const { data: profiles, error: profileError } = await supabase
              .from('profiles')
              .select('id, name')
              .in('id', studentIds);

            if (profileError) throw profileError;

            const { data: applications, error: applicationError } = await supabase
              .from('hostel_applications')
              .select('id, course')
              .in('id', studentIds);

            if (applicationError) throw applicationError;

            students = profiles.map((profile) => {
              const application = applications.find((app) => app.id === profile.id);
              return {
                id: profile.id,
                name: profile.name,
                course: application?.course || 'N/A',
              };
            });
          }

          floor.rooms.push({
            id: room.room_number,
            capacity: room.capacity,
            occupied: room.occupants,
            vacant: room.vacant,
            students,
            status:
              room.occupants === room.capacity
                ? 'full'
                : room.occupants === 0
                ? 'empty'
                : 'partial',
          });
          floor.roomCount += 1;
        }

        const floorsArray = Array.from(floorMap.values());
        console.log(`Floors generated for ${selectedBuilding.name}:`, floorsArray);
        setFloors(floorsArray);
      } catch (err) {
        console.error('Error fetching floors:', err);
        setError('Failed to load floor data');
      } finally {
        setIsLoading(false);
      }
    }

    if (selectedBlock) {
      fetchFloors();
    }

    // Cleanup on unmount or selectedBlock change
    return () => {
      setFloors([]);
    };
  }, [selectedBlock, buildings]);

  return { floors, isLoading, error };
};