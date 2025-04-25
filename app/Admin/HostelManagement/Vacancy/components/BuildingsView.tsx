import BuildingCard from './BuildingCard';
import StatusLegend from './StatusLegend';
import { Building } from '../types';

interface BuildingsViewProps {
  buildings: Building[];
  onBlockClick: (blockId: number) => void;
}

const BuildingsView = ({ buildings, onBlockClick }: BuildingsViewProps) => {
  return (
    <>
      <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
        <h1 className="text-2xl font-bold text-red-800 uppercase">
          VACANCY STATUS
        </h1>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-bold text-red-800 mb-6">Buildings</h2>

        {buildings.length > 0 ? (
          buildings.map((building) => (
            <BuildingCard
              key={building.id}
              building={building}
              onClick={() => onBlockClick(building.id)}
            />
          ))
        ) : (
          <div className="text-gray-500 text-center py-4">
            No buildings found
          </div>
        )}
      </div>

      <StatusLegend />
    </>
  );
};

export default BuildingsView;