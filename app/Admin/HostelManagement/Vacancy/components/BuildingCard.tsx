import { ChevronDown } from 'lucide-react';
// import { Building } from '../ Secondary';
import { Building as BuildingType } from '../types';

interface BuildingCardProps {
  building: BuildingType;
  onClick: () => void;
}

const BuildingCard = ({ building, onClick }: BuildingCardProps) => {
  return (
    <div
      className="border rounded-lg p-4 mb-4 cursor-pointer hover:bg-gray-50"
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">{building.name}</h3>
          <p className="text-sm text-gray-600">
            {building.gender} • {building.rooms} rooms • {building.floors} floors
          </p>
        </div>
        <ChevronDown size={20} />
      </div>
    </div>
  );
};

export default BuildingCard;