"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../supabase/supabaseClient';
import Header from '@/components/Header'; // Import the Header component
import Footer from '@/components/Footer'; // Import the Footer component

export default function ViewDatabases() {
  const [tables, setTables] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, any[]>>({});
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setError(null);
    try {
      const tableNames = ['hostel_applications', 'profiles']; // Add more known table names as needed
      setTables(tableNames);

      if (tableNames.length > 0) {
        fetchTableData(tableNames[0]);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Failed to fetch tables. Please try again later.');
    }
  };

  const fetchTableData = async (table: string) => {
    setError(null);
    try {
      const { data: tableData, error: tableError } = await supabase.from(table).select('*');
      if (tableError) throw tableError;

      setTableData((prev) => ({ ...prev, [table]: tableData || [] }));
      setSelectedTable(table);
    } catch (error) {
      console.error(`Error fetching data for table ${table}:`, error);
      setError(`Failed to fetch data for table ${table}.`);
    }
  };

  const handleTableChange = (table: string) => {
    if (!tableData[table]) {
      fetchTableData(table);
    } else {
      setSelectedTable(table);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        rightContent={
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-[#800000]">Database Viewer</h1>
            <p className="text-sm text-gray-600">Admin Management Panel</p>
          </div>
        }
      />

      <div className="flex w-full">
        {/* Sidebar - List of Tables */}
        <div className="w-1/4 p-4 bg-gray-50 min-h-screen">
          <h2 className="text-lg font-semibold mb-4">Tables</h2>
          <ul className="space-y-2">
            {tables.map((table) => (
              <li
                key={table}
                className={`cursor-pointer p-2 rounded ${
                  selectedTable === table ? 'bg-red-600 text-white' : 'bg-gray-200'
                }`}
                onClick={() => handleTableChange(table)}
              >
                {table}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content - Table Data */}
        <div className="w-3/4 p-6">
          {error ? (
            <div className="text-red-600 text-lg">{error}</div>
          ) : selectedTable && Array.isArray(tableData[selectedTable]) && tableData[selectedTable].length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 text-lg">No data found in this table.</p>
            </div>
          ) : selectedTable && Array.isArray(tableData[selectedTable]) && tableData[selectedTable].length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">{selectedTable}</h2>
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 p-2 text-left">#</th>
                    {Object.keys(tableData[selectedTable][0]).map((column) => (
                      <th key={column} className="border border-gray-300 p-2 text-left">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData[selectedTable].map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t">
                      <td className="border border-gray-300 p-2 text-gray-600">{rowIndex + 1}</td>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="border border-gray-300 p-2">
                          {value !== null && value !== undefined ? value.toString() : 'NULL'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}