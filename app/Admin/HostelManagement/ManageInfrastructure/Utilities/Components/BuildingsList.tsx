// app/Admin/HostelManagement/ManageInfrastructure/Utilities/Components/BuildingsList.tsx

import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import BuildingCard from './BuildingCard';
import { Building } from '../../page';

interface BuildingsListProps {
  buildings: Building[];
  isLoading: boolean;
  supabase: SupabaseClient;
  onUpdate: () => void;
  setMessage: (message: { text: string; type: 'success' | 'error' | '' }) => void;
  title: string;
}

export default function BuildingsList({ 
  buildings, 
  isLoading, 
  supabase, 
  onUpdate,
  setMessage,
  title
}: BuildingsListProps) {
  const [expandedBuilding, setExpandedBuilding] = useState<string | null>(null);

  // Toggle expanded building
  const toggleExpand = (buildingName: string) => {
    setExpandedBuilding(expandedBuilding === buildingName ? null : buildingName);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[#800000]">{title}</h2>
      
      {isLoading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#800000]"></div>
        </div>
      ) : buildings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {buildings.map((building) => (
            <BuildingCard
              key={building.name}
              building={building}
              isExpanded={expandedBuilding === building.name}
              onToggle={() => toggleExpand(building.name)}
              supabase={supabase}
              onUpdate={onUpdate}
              setMessage={setMessage}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No buildings found. Add a building to get started.
        </div>
      )}
    </div>
  );
}