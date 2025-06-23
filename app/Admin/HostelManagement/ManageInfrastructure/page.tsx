// app/Admin/HostelManagement/ManageInfrastructure/page.tsx

"use client";

import { useState, useEffect } from "react";
import AddNewBuilding from "./Utilities/Components/AddNewBuilding";
import BuildingsList from "./Utilities/Components/BuildingsList";
import { createClient } from "@supabase/supabase-js";
import Header from "@/app/Components/Header";
import Footer from "@/app/Components/Footer";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Building {
  hostel_id: string;
  name: string;
  type: "Girls" | "Boys";
  prefix: string;
  floors: number[];
  roomCount: number;
  floor_count: number;
  hostel_fees: number;
}

export default function ManageInfrastructure() {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });

  // Fetch all buildings (hostels) data from Supabase
  const fetchBuildings = async () => {
    setIsLoading(true);
    try {
      // First, get all hostels
      const { data: hostels, error: hostelsError } = await supabase
        .from("hostel_db")
        .select("*")
        .order("name", { ascending: true });

      if (hostelsError) throw hostelsError;

      // Then get all rooms to calculate floors and room counts
      const { data: rooms, error: roomsError } = await supabase
        .from("room_db")
        .select("hostel_id, floor");

      if (roomsError) throw roomsError;

      // Process data to create buildings array
      const buildingsData: Building[] = hostels?.map((hostel) => {
        // Filter rooms for this hostel
        const hostelRooms = rooms?.filter(room => room.hostel_id === hostel.hostel_id) || [];
        
        // Get unique floors for this hostel
        const floors = [...new Set(hostelRooms.map(room => room.floor))].sort((a, b) => a - b);
        
        return {
          hostel_id: hostel.hostel_id,
          name: hostel.name,
          type: hostel.type,
          prefix: hostel.prefix,
          floors: floors,
          roomCount: hostelRooms.length,
          floor_count: hostel.floor_count,
          hostel_fees: hostel.hostel_fees,
        };
      }) || [];

      setBuildings(buildingsData);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      setMessage({
        text: `Error loading buildings: ${(error as Error).message}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleBuildingAdded = () => {
    fetchBuildings();
    setShowAddForm(false);
    setMessage({ text: "Building successfully added!", type: "success" });

    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 5000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="w-full max-w-6xl mx-auto pt-5">
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-[#800000]">
              Manage Infrastructure
            </h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#600000] transition"
            >
              {showAddForm ? "Cancel" : "Add New Building"}
            </button>
          </div>

          {/* Status message */}
          {message.text && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Add New Building Form */}
          {showAddForm && (
            <AddNewBuilding
              supabase={supabase}
              onSuccess={handleBuildingAdded}
            />
          )}
        </div>

        {/* Buildings List - using a single component for all buildings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <BuildingsList
            buildings={buildings}
            isLoading={isLoading}
            supabase={supabase}
            onUpdate={fetchBuildings}
            setMessage={setMessage}
            title="Hostels"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}