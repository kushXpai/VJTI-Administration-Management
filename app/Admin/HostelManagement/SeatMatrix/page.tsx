"use client";

import { useState, useEffect } from "react";
import Header from "@/app/Components/Header";
import Footer from "@/app/Components/Footer";
import { supabase } from "@/supabase/supabaseClient";

interface Building {
  name: string;
  type: "Girls" | "Boys";
  prefix: string;
  floors: number[];
  roomCount: number;
}

export default function ViewBuildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBuilding, setExpandedBuilding] = useState<string | null>(null);
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null);
  const [floorCapacities, setFloorCapacities] = useState<Record<string, string>>({});
  const [floorMessage, setFloorMessage] = useState("");

  useEffect(() => {
    const fetchBuildings = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("building_name", { ascending: true });

      if (error) {
        console.error("Error fetching buildings:", error);
        return;
      }

      const buildingsMap = new Map<string, Building>();

      data?.forEach((room) => {
        const buildingName = room.building_name;

        if (!buildingsMap.has(buildingName)) {
          buildingsMap.set(buildingName, {
            name: buildingName,
            type: room.type,
            prefix: room.room_number.charAt(0),
            floors: [],
            roomCount: 0,
          });
        }

        const building = buildingsMap.get(buildingName)!;

        if (!building.floors.includes(room.floor)) {
          building.floors.push(room.floor);
          building.floors.sort((a, b) => a - b);
        }

        building.roomCount++;
      });

      setBuildings(Array.from(buildingsMap.values()));
      setIsLoading(false);
    };

    fetchBuildings();
  }, []);

  const handleCapacitySubmit = async (buildingName: string, floor: number) => {
    const key = `${buildingName}-${floor}`;
    const capacityValue = floorCapacities[key];

    if (!capacityValue) return;

    const { error } = await supabase
      .from("rooms")
      .update({ capacity: Number(capacityValue) })
      .eq("building_name", buildingName)
      .eq("floor", floor);

    if (error) {
      console.error("Error updating capacity:", error);
      setFloorMessage("Failed to update.");
    } else {
      setFloorMessage("Capacity updated!");
      setTimeout(() => setFloorMessage(""), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex flex-col gap-4 max-w-6xl mx-auto w-full py-6 px-4">
        <h1 className="text-2xl font-bold text-[#800000] mb-2">
          Edit Seat Matrix of all Buildings
        </h1>

        {isLoading ? (
          <p className="text-gray-600">Loading buildings...</p>
        ) : buildings.length === 0 ? (
          <p className="text-gray-600">No buildings found.</p>
        ) : (
          buildings.map((building) => (
            <div
              key={building.name}
              className="bg-white rounded-lg shadow-md p-4 border border-gray-200 transition-all duration-300 ease-in-out"
            >
              <button
                onClick={() =>
                  setExpandedBuilding(
                    expandedBuilding === building.name ? null : building.name
                  )
                }
                className="w-full text-left hover: cursor-pointer"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">{building.name}</h2>
                  <span className="text-sm text-gray-500">{building.type}</span>
                </div>
                <p className="text-gray-700">
                  {building.roomCount} rooms | {building.floors.length} floors
                </p>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedBuilding === building.name
                    ? "max-h-[1000px] mt-3"
                    : "max-h-0"
                }`}
              >
                {building.floors.map((floor) => {
                  const key = `${building.name}-${floor}`;
                  return (
                    <div
                      key={floor}
                      className="ml-4 mb-2 p-3 bg-gray-200 rounded transition-all duration-300 ease-in-out"
                    >
                      <button
                        onClick={() =>
                          setExpandedFloor(
                            expandedFloor === key ? null : key
                          )
                        }
                        className="flex justify-between text-md font-medium text-left w-full"
                      >
                        <p>Floor {floor}</p>
                        <p className="font-light">
                          Capacity: {floorCapacities[key] || "Not set"}
                        </p>
                      </button>

                      <div
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                          expandedFloor === key ? "max-h-96 mt-2" : "max-h-0"
                        }`}
                      >
                        <div className="ml-4 mt-2">
                          <p className="font-semibold mb-1 text-sm">
                            Edit per Floor Capacity
                          </p>
                          <input
                            type="number"
                            value={floorCapacities[key] || ""}
                            onChange={(e) =>
                              setFloorCapacities({
                                ...floorCapacities,
                                [key]: e.target.value,
                              })
                            }
                            placeholder="Enter new capacity"
                            className="border px-2 py-1 mr-2 bg-white rounded"
                          />
                          <button
                            onClick={() => handleCapacitySubmit(building.name, floor)}
                            className="bg-[#800000] text-white px-3 py-1 rounded hover:bg-[#600000]"
                          >
                            Submit
                          </button>
                          {floorMessage && (
                            <p className="text-sm text-green-600 mt-1">
                              {floorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}
