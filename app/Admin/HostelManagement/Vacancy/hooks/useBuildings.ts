import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { Building } from '../types';

export const useBuildings = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBuildings() {
      setIsLoading(true);
      try {
        // Fetch distinct buildings and their types
        const { data: buildingData, error: buildingError } = await supabase
          .from('rooms')
          .select('building_name, type')
          .order('building_name');

        if (buildingError) throw buildingError;

        // Deduplicate buildings
        const buildingsMap = new Map<string, Building>();
        buildingData?.forEach((room, index) => {
          if (!buildingsMap.has(room.building_name)) {
            buildingsMap.set(room.building_name, {
              id: index + 1, // Assign incremental ID
              name: room.building_name,
              gender: room.type,
              rooms: 0,
              floors: 0,
            });
          }
        });

        // Fetch room counts and floor counts for each building
        for (const [buildingName, building] of buildingsMap) {
          // Room count
          const { count: roomCount, error: roomError } = await supabase
            .from('rooms')
            .select('id', { count: 'exact', head: true })
            .eq('building_name', buildingName);

          if (roomError) throw roomError;
          building.rooms = roomCount || 0;

          // Floor count
          const { data: floorData, error: floorError } = await supabase
            .from('rooms')
            .select('floor')
            .eq('building_name', buildingName);

          if (floorError) throw floorError;
          const uniqueFloors = new Set(floorData?.map((item) => item.floor));
          building.floors = uniqueFloors.size;
        }

        setBuildings(Array.from(buildingsMap.values()));
      } catch (err) {
        console.error('Error fetching buildings:', err);
        setError('Failed to load buildings data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBuildings();
  }, []);

  return { buildings, isLoading, error };
};