'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Menu {
  week_number: number;
  day_of_week: number;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export default function MessContent() {
  const supabase = createClientComponentClient();
  const [weekMenus, setWeekMenus] = useState<Menu[]>([]);
  const [todayMenu, setTodayMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWeek, setShowWeek] = useState(false);

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
    const referenceDate = new Date('2025-01-01');
    referenceDate.setHours(0, 0, 0, 0);
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);
    const diffTime = currentDate.getTime() - referenceDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor((diffDays + referenceDate.getDay() + 6) / 7);
  };

  const getCurrentDayOfWeek = (date: Date = new Date()) => {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  };

  const fetchWeekMenus = async () => {
    setLoading(true);
    try {
      const currentWeekNumber = getCurrentWeekNumber();
      const { data, error } = await supabase
        .from('mess_menu_weekly')
        .select('*')
        .eq('week_number', currentWeekNumber)
        .order('day_of_week');

      if (error) throw error;
      setWeekMenus(data || []);
    } catch (err) {
      console.error('Error fetching week menus:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayMenu = async () => {
    try {
      const currentWeekNumber = getCurrentWeekNumber();
      const currentDayOfWeek = getCurrentDayOfWeek();
      const { data, error } = await supabase
        .from('mess_menu_weekly')
        .select('*')
        .eq('week_number', currentWeekNumber)
        .eq('day_of_week', currentDayOfWeek)
        .single();

      if (error) throw error;
      setTodayMenu(data);
    } catch (err) {
      console.error('Error fetching today menu:', err);
      setTodayMenu(null);
    }
  };

  const getCurrentMeal = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    return 'dinner';
  };

  const formatMenuItems = (items: string) => {
    if (!items || items.trim() === '' || items === 'Menu not yet updated') {
      return ['Menu not available'];
    }
    return items.split(',').map(item => item.trim()).filter(item => item !== '');
  };

  const MenuItemsList = ({ items }: { items: string }) => {
    const formattedItems = formatMenuItems(items);
    return (
      <div className="space-y-2">
        {formattedItems.map((item, i) => (
          <div key={i} className="flex items-start">
            <div className="mr-2 mt-1">•</div>
            <div className="text-gray-700">{item}</div>
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    fetchTodayMenu();
    fetchWeekMenus();

    const channel = supabase
      .channel('realtime-mess')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mess_menu_weekly',
        },
        () => {
          fetchTodayMenu();
          fetchWeekMenus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const currentMeal = getCurrentMeal();
  const currentDayOfWeek = getCurrentDayOfWeek();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {!showWeek ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-[#800000]">Today's Mess Menu</h2>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#800000]"></div>
              </div>
            ) : todayMenu ? (
              <div className="space-y-8">
                <div
                  className={`p-5 rounded-lg ${
                    currentMeal === 'breakfast' ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50'
                  }`}
                >
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    Breakfast
                    {currentMeal === 'breakfast' && (
                      <span className="ml-3 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">
                        Now Serving
                      </span>
                    )}
                  </h3>
                  <MenuItemsList items={todayMenu.breakfast} />
                </div>

                <div
                  className={`p-5 rounded-lg ${
                    currentMeal === 'lunch' ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'
                  }`}
                >
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    Lunch
                    {currentMeal === 'lunch' && (
                      <span className="ml-3 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                        Now Serving
                      </span>
                    )}
                  </h3>
                  <MenuItemsList items={todayMenu.lunch} />
                </div>

                <div
                  className={`p-5 rounded-lg ${
                    currentMeal === 'dinner' ? 'bg-indigo-50 border-2 border-indigo-300' : 'bg-gray-50'
                  }`}
                >
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    Dinner
                    {currentMeal === 'dinner' && (
                      <span className="ml-3 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full">
                        Now Serving
                      </span>
                    )}
                  </h3>
                  <MenuItemsList items={todayMenu.dinner} />
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600">No menu available for today.</p>
              </div>
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={() => {
                  setShowWeek(true);
                  fetchWeekMenus();
                }}
                className="px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#660000] transition-colors duration-200"
              >
                View Full Week Menu
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-[#800000]">Weekly Mess Menu</h2>
              <button
                onClick={() => setShowWeek(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                Back to Today's Menu
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#800000]"></div>
              </div>
            ) : weekMenus.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse shadow-lg rounded-lg">
                  <thead className="bg-[#800000] text-white">
                    <tr>
                      <th className="p-4 border">Day</th>
                      <th className="p-4 border">Breakfast</th>
                      <th className="p-4 border">Lunch</th>
                      <th className="p-4 border">Dinner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekMenus.map((menu) => {
                      const isToday = menu.day_of_week === currentDayOfWeek;
                      return (
                        <tr
                          key={`${menu.week_number}-${menu.day_of_week}`}
                          className={`${dayColors[menu.day_of_week]} border-b ${
                            isToday ? 'border-2 border-red-500' : ''
                          }`}
                        >
                          <td className="p-4 border font-semibold">
                            {dayNames[menu.day_of_week]}
                            {isToday && (
                              <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                                Today
                              </span>
                            )}
                          </td>
                          <td className="p-4 border">
                            <MenuItemsList items={menu.breakfast} />
                          </td>
                          <td className="p-4 border">
                            <MenuItemsList items={menu.lunch} />
                          </td>
                          <td className="p-4 border">
                            <MenuItemsList items={menu.dinner} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600">No menu available for this week.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}