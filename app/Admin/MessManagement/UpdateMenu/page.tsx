'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast, { Toaster } from 'react-hot-toast';

interface Menu {
  week_number: number;
  day_of_week: number;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export default function UpdateMessMenu() {
  const supabase = createClientComponentClient();
  const [weekMenus, setWeekMenus] = useState<Menu[]>([]);
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

  const getCurrentWeekNumber = (date: Date = new Date()) => {
    const referenceDate = new Date('2025-01-01'); // Reference point
    referenceDate.setHours(0, 0, 0, 0);
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    // Calculate days since reference date
    const diffTime = currentDate.getTime() - referenceDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Calculate week number (week starts on Monday)
    const weekNumber = Math.floor((diffDays + referenceDate.getDay() + 6) / 7);
    return weekNumber;
  };

  const checkDatabaseConnection = async () => {
    try {
      const { error } = await supabase.from('mess_menu_weekly').select('*').limit(1);
      if (error) throw error;
      setDbConnectionStatus('connected');
      return true;
    } catch (err) {
      setDbConnectionStatus('failed');
      setError(`Database connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  };

  const fetchWeekMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const isConnected = await checkDatabaseConnection();
      if (!isConnected) return;

      const currentWeekNumber = getCurrentWeekNumber();

      const { data, error } = await supabase
        .from('mess_menu_weekly')
        .select('*')
        .eq('week_number', currentWeekNumber)
        .order('day_of_week');

      if (error) throw error;

      const emptyWeek: Menu[] = Array.from({ length: 7 }).map((_, i) => ({
        week_number: currentWeekNumber,
        day_of_week: i,
        breakfast: 'Menu not yet updated',
        lunch: 'Menu not yet updated',
        dinner: 'Menu not yet updated',
      }));

      if (!data?.length) {
        // No data for the current week, create a new blank week
        await supabase.from('mess_menu_weekly').upsert(emptyWeek);
        setWeekMenus(emptyWeek);
        toast.success('New week created with blank menus');
      } else {
        // Merge existing data with empty week template
        const fullWeek = emptyWeek.map(emptyDay => {
          const existingDay = data.find(d => d.day_of_week === emptyDay.day_of_week);
          return existingDay || emptyDay;
        });
        setWeekMenus(fullWeek);
        toast.success('Menus loaded successfully');
      }
    } catch (err) {
      setError(`Failed to fetch menus: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof Omit<Menu, 'week_number' | 'day_of_week'>, value: string) => {
    const updatedMenus = [...weekMenus];
    updatedMenus[index][field] = value;
    setWeekMenus(updatedMenus);
  };

  const handleSave = async (index: number) => {
    try {
      // Wrap single Menu object in an array for upsert
      const { error } = await supabase
        .from('mess_menu_weekly')
        .upsert([weekMenus[index]]);
      if (error) throw error;
      toast.success('Menu saved successfully');
    } catch (err) {
      toast.error(`Error saving menu: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleSaveAll = async () => {
    try {
      const { error } = await supabase
        .from('mess_menu_weekly')
        .upsert(weekMenus);
      if (error) throw error;
      toast.success('All menus saved successfully');
    } catch (err) {
      toast.error(`Error saving all menus: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    fetchWeekMenus();
  }, [ fetchWeekMenus ]);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#800000]">Admin - Weekly Mess Menu</h2>
        <div className="space-x-4">
          <button
            onClick={handleSaveAll}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            disabled={loading || dbConnectionStatus !== 'connected'}
          >
            Save All
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
          <button
            className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
            onClick={fetchWeekMenus}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#800000]"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-lg rounded-lg">
            <thead className="bg-[#800000] text-white">
              <tr>
                <th className="p-4 border">Day</th>
                <th className="p-4 border">Breakfast</th>
                <th className="p-4 border">Lunch</th>
                <th className="p-4 border">Dinner</th>
                <th className="p-4 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {weekMenus.map((menu, index) => (
                <tr key={`${menu.week_number}-${menu.day_of_week}`} className={`${dayColors[index]} border-b`}>
                  <td className="p-4 border font-semibold">{dayNames[menu.day_of_week]}</td>
                  <td className="p-4 border">
                    <textarea
                      className="w-full p-2 border rounded resize-none"
                      rows={3}
                      value={menu.breakfast}
                      onChange={(e) => handleChange(index, 'breakfast', e.target.value)}
                    />
                  </td>
                  <td className="p-4 border">
                    <textarea
                      className="w-full p-2 border rounded resize-none"
                      rows={3}
                      value={menu.lunch}
                      onChange={(e) => handleChange(index, 'lunch', e.target.value)}
                    />
                  </td>
                  <td className="p-4 border">
                    <textarea
                      className="w-full p-2 border rounded resize-none"
                      rows={3}
                      value={menu.dinner}
                      onChange={(e) => handleChange(index, 'dinner', e.target.value)}
                    />
                  </td>
                  <td className="p-4 border text-center">
                    <button
                      onClick={() => handleSave(index)}
                      className="bg-[#800000] hover:bg-[#5a0000] text-white px-4 py-2 rounded"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}