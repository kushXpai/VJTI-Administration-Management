// app/Admin/Database/ViewDatabases/page.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../../supabase/supabaseClient';
import Header from '@/app/Components/Header';
import Footer from '@/app/Components/Footer';

export default function ViewDatabases() {
  const [tables, setTables] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, Record<string, unknown>[]>>({});
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of scrolling containers
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const fetchTableData = useCallback(async (table: string) => {
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
  }, []);

  const fetchTables = useCallback(async () => {
    setError(null);
    try {
      const tableNames = ['accepted_hostel_allocations', 'grievances', 'hostel_applications', 'mess_attendance', 'mess_menu_weekly', 'mess_payments', 'profiles', 'rooms']; // Add more known table names as needed
      setTables(tableNames);

      if (tableNames.length > 0) {
        fetchTableData(tableNames[0]);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Failed to fetch tables. Please try again later.');
    }
  }, [fetchTableData]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Synchronize horizontal scroll between body and header
  useEffect(() => {
    const handleScroll = () => {
      if (bodyRef.current && headerRef.current) {
        headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
      }
    };

    const bodyElement = bodyRef.current;
    
    if (bodyElement) {
      bodyElement.addEventListener('scroll', handleScroll);
      
      return () => {
        bodyElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [selectedTable]);

  const handleTableChange = (table: string) => {
    if (!tableData[table]) {
      fetchTableData(table);
    } else {
      setSelectedTable(table);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        rightContent={
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-[#800000]">Database Viewer</h1>
            <p className="text-sm text-gray-600">Admin Management Panel</p>
          </div>
        }
      />

      <div className="flex w-full flex-grow">
        <div className="w-1/5 p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Tables</h2>
          <ul className="space-y-2">
            {tables.map((table) => (
              <li
                key={table}
                className={`cursor-pointer p-2 rounded ${
                  selectedTable === table ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => handleTableChange(table)}
              >
                {table}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="w-4/5 p-4 overflow-hidden">
          {error ? (
            <div className="text-red-600 text-lg">{error}</div>
          ) : selectedTable && Array.isArray(tableData[selectedTable]) && tableData[selectedTable].length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 text-lg">No data found in this table.</p>
            </div>
          ) : selectedTable && Array.isArray(tableData[selectedTable]) && tableData[selectedTable].length > 0 ? (
            <div className="flex flex-col h-full">
              <h2 className="text-xl font-semibold mb-4">{selectedTable}</h2>
              
              <div className="border border-gray-300 rounded shadow flex-grow overflow-hidden">
                {/* Table Header with horizontal scrolling synchronized with body */}
                <div 
                  ref={headerRef}
                  className="overflow-hidden bg-gray-200 sticky top-0 z-10"
                >
                  <div className="min-w-max">
                    <div className="flex">
                      <div className="p-2 font-semibold border-r border-b border-gray-300 text-left w-12">
                        #
                      </div>
                      {Object.keys(tableData[selectedTable][0]).map((column) => (
                        <div 
                          key={column} 
                          className="p-2 font-semibold border-r border-b border-gray-300 text-left whitespace-nowrap"
                          style={{ minWidth: column.length > 15 ? '200px' : '150px' }}
                        >
                          {column}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Table Body with horizontal and vertical scrolling */}
                <div 
                  ref={bodyRef}
                  className="overflow-auto max-h-[calc(100vh-250px)]"
                  style={{ overflowX: 'auto', overflowY: 'auto' }}
                >
                  <div className="min-w-max">
                    {tableData[selectedTable].map((row, rowIndex) => (
                      <div 
                        key={rowIndex} 
                        className={`flex ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                      >
                        <div className="p-2 border-r border-b border-gray-300 w-12 text-gray-600">
                          {rowIndex + 1}
                        </div>
                        {Object.entries(row).map(([key, value], colIndex) => (
                          <div 
                            key={`${rowIndex}-${colIndex}`} 
                            className="p-2 border-r border-b border-gray-300 overflow-hidden text-ellipsis"
                            style={{ minWidth: key.length > 15 ? '200px' : '150px' }}
                          >
                            {value !== null && value !== undefined ? String(value) : 'NULL'}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Select a table to view its data</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}