import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { Building, Floor } from '../types';

export const useFloors = (selectedBlock: number | null, buildings: Building[]) => {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFloors() {
      if (!selectedBlock) return;

      setIsLoading(true);
      try {
        const selectedBuilding = buildings.find((b) => b.id === selectedBlock);
        if (!selectedBuilding) return;

        const { data: floorData, error: floorError } = await supabase
          .from('rooms')
          .select('floor')
          .eq('building_name', selectedBuilding.name)
          .order('floor');

        if (floorError) throw floorError;

        // Removed the type assertion to resolve ESLint error
        const uniqueFloorNumbers = Array.from(
          new Set(floorData?.map((item) => item.floor) || [])
        );

        const floorsArray: Floor[] = [];

        for (const floorNumber of uniqueFloorNumbers) {
          const { data: roomsData, error: roomsError } = await supabase
            .from('rooms')
            .select('*')
            .eq('building_name', selectedBuilding.name)
            .eq('floor', floorNumber)
            .order('room_number');

          if (roomsError) throw roomsError;

          const formattedRooms = await Promise.all(
            (roomsData || []).map(async (room) => {
              const studentIds: string[] =
                typeof room.occupants_list === 'string'
                  ? JSON.parse(room.occupants_list)
                  : room.occupants_list || [];

              let profileData: { id: string; name: string }[] = [];
              let applicationData: { id: string; course: string }[] = [];

              if (studentIds.length > 0) {
                const { data: profiles, error: profileError } = await supabase
                  .from('profiles')
                  .select('id, name')
                  .in('id', studentIds);

                if (profileError) throw profileError;
                profileData = profiles;

                // Changed here: using 'id' instead of 'user_id'
                const { data: applications, error: applicationError } = await supabase
                  .from('hostel_applications')
                  .select('id, course') // Changed from 'user_id' to 'id'
                  .in('id', studentIds); // Changed from 'user_id' to 'id'

                if (applicationError) throw applicationError;
                applicationData = applications;
              }

              // Changed here: comparing with 'id' instead of 'user_id'
              const students = profileData.map((profile) => {
                const application = applicationData.find(
                  (app) => app.id === profile.id // Changed from app.user_id
                );
                return {
                  id: profile.id,
                  name: profile.name,
                  course: application?.course || 'N/A',
                };
              });

              return {
                id: room.room_number,
                capacity: room.capacity,
                occupied: room.occupants,
                vacant: room.vacant,
                students,
                status:
                  room.occupants === room.capacity
                    ? 'full' as const
                    : room.occupants === 0
                    ? 'empty' as const
                    : 'partial' as const,
              };
            })
          );

          floorsArray.push({
            id: floorNumber,
            blockId: selectedBlock,
            name: `Floor ${floorNumber}`,
            roomCount: formattedRooms.length,
            rooms: formattedRooms,
          });
        }

        setFloors(floorsArray);
      } catch (err) {
        console.error('Application fetch error:', err);
        setError('Failed to load floor data');
      } finally {
        setIsLoading(false);
      }
    }

    if (selectedBlock) {
      fetchFloors();
    }
  }, [selectedBlock, buildings]);

  return { floors, isLoading, error };
};