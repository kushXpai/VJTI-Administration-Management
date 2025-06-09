'use client';

import { useState } from 'react';
import Header from '@/app/Components/Header';
import Footer from '@/app/Components/Footer';
import BuildingsView from './components/BuildingsView';
import RoomsView from './components/RoomsView';
import { useBuildings } from './hooks/useBuildings';
import { useFloors } from './hooks/useFloors';

export default function Vacancy() {
  const [activeView, setActiveView] = useState<'buildings' | 'rooms'>(
    'buildings'
  );
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const { buildings, isLoading: buildingsLoading, error: buildingsError } =
    useBuildings();
  const { floors, isLoading: floorsLoading, error: floorsError } = useFloors(
    selectedBlock,
    buildings
  );

  const handleBlockClick = (blockId: number) => {
    setSelectedBlock(blockId);
    setActiveView('rooms');
  };

  const handleBackToBuildings = () => {
    setActiveView('buildings');
    setSelectedBlock(null);
  };

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'full':
        return 'bg-red-50 border-red-200';
      case 'partial':
        return 'bg-yellow-50 border-yellow-200';
      case 'empty':
        return 'bg-green-50 border-green-200';
      default:
        return '';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'full':
        return 'text-red-700';
      case 'partial':
        return 'text-yellow-700';
      case 'empty':
        return 'text-green-700';
      default:
        return '';
    }
  };

  const isLoading = buildingsLoading || floorsLoading;
  const error = buildingsError || floorsError;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow container mx-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">
            {error}. Please try again later.
          </div>
        ) : activeView === 'buildings' ? (
          <BuildingsView
            buildings={buildings}
            onBlockClick={handleBlockClick}
          />
        ) : (
          <RoomsView
            block={buildings.find((b) => b.id === selectedBlock) ?? null}
            floors={floors}
            onBack={handleBackToBuildings}
            onRoomHover={setHoveredRoom}
            hoveredRoom={hoveredRoom}
            getRoomStatusColor={getRoomStatusColor}
            getStatusTextColor={getStatusTextColor}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}