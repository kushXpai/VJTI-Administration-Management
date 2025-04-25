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
        const { data, error } = await supabase
          .from('rooms')
          .select('building_name, type');

        if (error) throw error;

        if (data) {
          const buildingsMap = new Map();

          for (const room of data) {
            if (!buildingsMap.has(room.building_name)) {
              buildingsMap.set(room.building_name, {
                id: buildingsMap.size + 1,
                name: room.building_name,
                gender: room.type,
                rooms: 0,
                floors: 0,
              });
            }
          }

          for (const [buildingName, building] of buildingsMap) {
            const { count: roomCount, error: roomError } = await supabase
              .from('rooms')
              .select('*', { count: 'exact', head: true })
              .eq('building_name', buildingName);

            if (roomError) throw roomError;
            building.rooms = roomCount || 0;

            const { data: floorData, error: floorError } = await supabase
              .from('rooms')
              .select('floor')
              .eq('building_name', buildingName);

            if (floorError) throw floorError;

            const uniqueFloors = new Set();
            floorData?.forEach((item) => uniqueFloors.add(item.floor));
            building.floors = uniqueFloors.size;
          }

          setBuildings(Array.from(buildingsMap.values()));
        }
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