// 'use client';

// import { useEffect, useState, useCallback } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import toast, { Toaster } from 'react-hot-toast';

// interface Menu {
//   week_number: number;
//   day_of_week: number;
//   breakfast: string;
//   lunch: string;
//   dinner: string;
// }

// export default function UpdateMessMenu() {
//   const supabase = createClientComponentClient();
//   const [weekMenus, setWeekMenus] = useState<Menu[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [dbConnectionStatus, setDbConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

//   const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

//   const dayColors = [
//     'bg-blue-100', // Monday
//     'bg-green-100', // Tuesday
//     'bg-purple-100', // Wednesday
//     'bg-yellow-100', // Thursday
//     'bg-orange-100', // Friday
//     'bg-pink-100', // Saturday
//     'bg-red-100', // Sunday
//   ];

//   const getCurrentWeekNumber = (date: Date = new Date()) => {
//     const referenceDate = new Date('2025-01-01'); // Reference point
//     referenceDate.setHours(0, 0, 0, 0);
//     const currentDate = new Date(date);
//     currentDate.setHours(0, 0, 0, 0);

//     // Calculate days since reference date
//     const diffTime = currentDate.getTime() - referenceDate.getTime();
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

//     // Calculate week number (week starts on Monday)
//     const weekNumber = Math.floor((diffDays + referenceDate.getDay() + 6) / 7);
//     return weekNumber;
//   };

//   const checkDatabaseConnection = useCallback(async () => {
//     try {
//       const { error } = await supabase.from('mess_menu_weekly').select('*').limit(1);
//       if (error) throw error;
//       setDbConnectionStatus('connected');
//       return true;
//     } catch (err) {
//       setDbConnectionStatus('failed');
//       setError(`Database connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
//       return false;
//     }
//   }, [supabase]);

//   const fetchWeekMenus = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const isConnected = await checkDatabaseConnection();
//       if (!isConnected) return;

//       const currentWeekNumber = getCurrentWeekNumber();
//       const { data, error } = await supabase
//         .from('mess_menu_weekly')
//         .select('*')
//         .eq('week_number', currentWeekNumber)
//         .order('day_of_week');

//       if (error) throw error;

//       const emptyWeek: Menu[] = Array.from({ length: 7 }).map((_, i) => ({
//         week_number: currentWeekNumber,
//         day_of_week: i,
//         breakfast: 'Menu not yet updated',
//         lunch: 'Menu not yet updated',
//         dinner: 'Menu not yet updated',
//       }));

//       if (!data?.length) {
//         await supabase.from('mess_menu_weekly').upsert(emptyWeek);
//         setWeekMenus(emptyWeek);
//         toast.success('New week created with blank menus');
//       } else {
//         const fullWeek = emptyWeek.map(emptyDay => {
//           const existingDay = data.find(d => d.day_of_week === emptyDay.day_of_week);
//           return existingDay || emptyDay;
//         });
//         setWeekMenus(fullWeek);
//         toast.success('Menus loaded successfully');
//       }
//     } catch (err) {
//       setError(`Failed to fetch menus: ${err instanceof Error ? err.message : 'Unknown error'}`);
//     } finally {
//       setLoading(false);
//     }
//   }, [supabase, checkDatabaseConnection]);


//   const handleChange = (index: number, field: keyof Omit<Menu, 'week_number' | 'day_of_week'>, value: string) => {
//     const updatedMenus = [...weekMenus];
//     updatedMenus[index][field] = value;
//     setWeekMenus(updatedMenus);
//   };

//   const handleSave = async (index: number) => {
//     try {
//       // Wrap single Menu object in an array for upsert
//       const { error } = await supabase
//         .from('mess_menu_weekly')
//         .upsert([weekMenus[index]]);
//       if (error) throw error;
//       toast.success('Menu saved successfully');
//     } catch (err) {
//       toast.error(`Error saving menu: ${err instanceof Error ? err.message : 'Unknown error'}`);
//     }
//   };

//   const handleSaveAll = async () => {
//     try {
//       const { error } = await supabase
//         .from('mess_menu_weekly')
//         .upsert(weekMenus);
//       if (error) throw error;
//       toast.success('All menus saved successfully');
//     } catch (err) {
//       toast.error(`Error saving all menus: ${err instanceof Error ? err.message : 'Unknown error'}`);
//     }
//   };

//   useEffect(() => {
//     fetchWeekMenus();
//   }, [fetchWeekMenus]);

//   return (
//     <div className="p-6 min-h-screen bg-gray-50">
//       <Toaster position="top-center" />
//       <div className="flex justify-between items-center mb-8">
//         <h2 className="text-3xl font-bold text-[#800000]">Admin - Weekly Mess Menu</h2>
//         <div className="space-x-4">
//           <button
//             onClick={handleSaveAll}
//             className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
//             disabled={loading || dbConnectionStatus !== 'connected'}
//           >
//             Save All
//           </button>
//         </div>
//       </div>

//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
//           <p className="text-red-700">{error}</p>
//           <button
//             className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
//             onClick={fetchWeekMenus}
//           >
//             Retry
//           </button>
//         </div>
//       )}

//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#800000]"></div>
//         </div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse shadow-lg rounded-lg">
//             <thead className="bg-[#800000] text-white">
//               <tr>
//                 <th className="p-4 border">Day</th>
//                 <th className="p-4 border">Breakfast</th>
//                 <th className="p-4 border">Lunch</th>
//                 <th className="p-4 border">Dinner</th>
//                 <th className="p-4 border">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {weekMenus.map((menu, index) => (
//                 <tr key={`${menu.week_number}-${menu.day_of_week}`} className={`${dayColors[index]} border-b`}>
//                   <td className="p-4 border font-semibold">{dayNames[menu.day_of_week]}</td>
//                   <td className="p-4 border">
//                     <textarea
//                       className="w-full p-2 border rounded resize-none"
//                       rows={3}
//                       value={menu.breakfast}
//                       onChange={(e) => handleChange(index, 'breakfast', e.target.value)}
//                     />
//                   </td>
//                   <td className="p-4 border">
//                     <textarea
//                       className="w-full p-2 border rounded resize-none"
//                       rows={3}
//                       value={menu.lunch}
//                       onChange={(e) => handleChange(index, 'lunch', e.target.value)}
//                     />
//                   </td>
//                   <td className="p-4 border">
//                     <textarea
//                       className="w-full p-2 border rounded resize-none"
//                       rows={3}
//                       value={menu.dinner}
//                       onChange={(e) => handleChange(index, 'dinner', e.target.value)}
//                     />
//                   </td>
//                   <td className="p-4 border text-center">
//                     <button
//                       onClick={() => handleSave(index)}
//                       className="bg-[#800000] hover:bg-[#5a0000] text-white px-4 py-2 rounded"
//                     >
//                       Save
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

// --------------------------------------------------------------------------------------------------------

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast, { Toaster } from 'react-hot-toast';

interface Mess {
  mess_id: string;
  name: string;
}

interface Menu {
  id?: string;
  mess_id: string;
  day_of_week: number;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export default function UpdateMessMenu() {
  const supabase = createClientComponentClient();
  const [messes, setMesses] = useState<Mess[]>([]);
  const [selectedMessId, setSelectedMessId] = useState<string>('');
  const [dayMenus, setDayMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const dayColors = [
    'bg-blue-100', // Monday
    'bg-green-100', // Tuesday
    'bg-purple-100', // Wednesday
    'bg-yellow-100', // Thursday
    'bg-orange-100', // Friday
    'bg-pink-100', // Saturday
    'bg-red-100', // Sunday
  ];

  const checkDatabaseConnection = useCallback(async () => {
    try {
      const { error } = await supabase.from('mess_db').select('*').limit(1);
      if (error) throw error;
      setDbConnectionStatus('connected');
      return true;
    } catch (err) {
      setDbConnectionStatus('failed');
      setError(`Database connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  }, [supabase]);

  const fetchMesses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('mess_db')
        .select('*')
        .order('name');

      if (error) throw error;

      setMesses(data || []);
      if (data && data.length > 0 && !selectedMessId) {
        setSelectedMessId(data[0].mess_id);
      }
    } catch (err) {
      setError(`Failed to fetch messes: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [supabase, selectedMessId]);

  const fetchDayMenus = useCallback(async () => {
    if (!selectedMessId) return;

    setLoading(true);
    setError(null);
    try {
      const isConnected = await checkDatabaseConnection();
      if (!isConnected) return;

      const { data, error } = await supabase
        .from('mess_menu')
        .select('*')
        .eq('mess_id', selectedMessId)
        .order('day_of_week');

      if (error) throw error;

      // Create default menu for all 7 days
      const defaultDays: Menu[] = Array.from({ length: 7 }).map((_, i) => ({
        mess_id: selectedMessId,
        day_of_week: i,
        breakfast: 'Menu not yet updated',
        lunch: 'Menu not yet updated',
        dinner: 'Menu not yet updated',
        snacks: 'Menu not yet updated',
      }));

      if (!data?.length) {
        // Insert default days data
        const { error: insertError } = await supabase
          .from('mess_menu')
          .insert(defaultDays);
        
        if (insertError) throw insertError;
        
        setDayMenus(defaultDays);
        toast.success('Default menus created for all days');
      } else {
        // Merge existing data with default structure
        const fullDays = defaultDays.map(defaultDay => {
          const existingDay = data.find(d => d.day_of_week === defaultDay.day_of_week);
          return existingDay || defaultDay;
        });
        setDayMenus(fullDays);
        toast.success('Menus loaded successfully');
      }
    } catch (err) {
      setError(`Failed to fetch menus: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedMessId, checkDatabaseConnection]);

  const handleChange = (index: number, field: keyof Omit<Menu, 'id' | 'mess_id' | 'day_of_week'>, value: string) => {
    const updatedMenus = [...dayMenus];
    updatedMenus[index][field] = value;
    setDayMenus(updatedMenus);
  };

  const handleSave = async (index: number) => {
    try {
      const menuToSave = dayMenus[index];
      const { error } = await supabase
        .from('mess_menu')
        .upsert([{
          ...menuToSave,
        }], {
          onConflict: 'mess_id,day_of_week'
        });
      
      if (error) throw error;
      toast.success(`${dayNames[menuToSave.day_of_week]} menu saved successfully`);
    } catch (err) {
      toast.error(`Error saving menu: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleSaveAll = async () => {
    try {
      const { error } = await supabase
        .from('mess_menu')
        .upsert(dayMenus, {
          onConflict: 'mess_id,day_of_week'
        });
      
      if (error) throw error;
      toast.success('All menus saved successfully');
    } catch (err) {
      toast.error(`Error saving all menus: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleMessChange = (messId: string) => {
    setSelectedMessId(messId);
    setDayMenus([]);
  };

  const handleClearDay = (index: number) => {
    const updatedMenus = [...dayMenus];
    updatedMenus[index] = {
      ...updatedMenus[index],
      breakfast: '',
      lunch: '',
      dinner: '',
      snacks: '',
    };
    setDayMenus(updatedMenus);
    toast.success(`${dayNames[index]} menu cleared`);
  };

  const handleClearAll = () => {
    const clearedMenus = dayMenus.map(menu => ({
      ...menu,
      breakfast: '',
      lunch: '',
      dinner: '',
      snacks: '',
    }));
    setDayMenus(clearedMenus);
    toast.success('All menus cleared');
  };

  useEffect(() => {
    fetchMesses();
  }, [fetchMesses]);

  useEffect(() => {
    if (selectedMessId) {
      fetchDayMenus();
    }
  }, [selectedMessId, fetchDayMenus]);

  const selectedMessName = messes.find(m => m.mess_id === selectedMessId)?.name || '';

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#800000]">Admin - Daily Mess Menu</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="mess-select" className="text-lg font-medium text-gray-700">
              Select Mess:
            </label>
            <select
              id="mess-select"
              value={selectedMessId}
              onChange={(e) => handleMessChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent"
              disabled={loading || messes.length === 0}
            >
              <option value="">Select a mess...</option>
              {messes.map((mess) => (
                <option key={mess.mess_id} value={mess.mess_id}>
                  {mess.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleClearAll}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            disabled={loading || !selectedMessId}
          >
            Clear All
          </button>
          <button
            onClick={handleSaveAll}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            disabled={loading || dbConnectionStatus !== 'connected' || !selectedMessId}
          >
            Save All
          </button>
        </div>
      </div>

      {selectedMessName && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-lg font-semibold text-blue-800">
            Currently editing: <span className="text-blue-900">{selectedMessName}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
          <button
            className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
            onClick={() => {
              fetchMesses();
              if (selectedMessId) fetchDayMenus();
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!selectedMessId && messes.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">Please select a mess to view and edit its menu.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#800000]"></div>
        </div>
      ) : selectedMessId && dayMenus.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-lg rounded-lg">
            <thead className="bg-[#800000] text-white">
              <tr>
                <th className="p-4 border">Day</th>
                <th className="p-4 border">Breakfast</th>
                <th className="p-4 border">Lunch</th>
                <th className="p-4 border">Snacks</th>
                <th className="p-4 border">Dinner</th>
                <th className="p-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dayMenus.map((menu, index) => (
                <tr key={`${menu.mess_id}-${menu.day_of_week}`} className={`${dayColors[index]} border-b`}>
                  <td className="p-4 border font-semibold">{dayNames[menu.day_of_week]}</td>
                  <td className="p-4 border">
                    <textarea
                      className="w-full p-2 border rounded resize-none"
                      rows={3}
                      value={menu.breakfast}
                      onChange={(e) => handleChange(index, 'breakfast', e.target.value)}
                      placeholder="Enter breakfast menu..."
                    />
                  </td>
                  <td className="p-4 border">
                    <textarea
                      className="w-full p-2 border rounded resize-none"
                      rows={3}
                      value={menu.lunch}
                      onChange={(e) => handleChange(index, 'lunch', e.target.value)}
                      placeholder="Enter lunch menu..."
                    />
                  </td>
                  <td className="p-4 border">
                    <textarea
                      className="w-full p-2 border rounded resize-none"
                      rows={3}
                      value={menu.snacks}
                      onChange={(e) => handleChange(index, 'snacks', e.target.value)}
                      placeholder="Enter snacks menu..."
                    />
                  </td>
                  <td className="p-4 border">
                    <textarea
                      className="w-full p-2 border rounded resize-none"
                      rows={3}
                      value={menu.dinner}
                      onChange={(e) => handleChange(index, 'dinner', e.target.value)}
                      placeholder="Enter dinner menu..."
                    />
                  </td>
                  <td className="p-4 border text-center">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleSave(index)}
                        className="bg-[#800000] hover:bg-[#5a0000] text-white px-3 py-1 rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleClearDay(index)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}