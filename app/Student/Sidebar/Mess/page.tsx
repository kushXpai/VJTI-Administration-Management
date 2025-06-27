'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Menu {
  mess_id: string;
  day_of_week: number;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  year: string;
}

export default function StudentMessMenu() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [todayMenu, setTodayMenu] = useState<Menu | null>(null);
  const [weeklyMenu, setWeeklyMenu] = useState<Menu[]>([]);
  const [messName, setMessName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWeekly, setShowWeekly] = useState(false);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayColors = [
  'bg-[#f0f8ff]', // Monday - AliceBlue
  'bg-[#f5f5dc]', // Tuesday - Beige
  'bg-[#f0fff0]', // Wednesday - HoneyDew
  'bg-[#fffaf0]', // Thursday - FloralWhite
  'bg-[#f5f5f5]', // Friday - WhiteSmoke
  'bg-[#fdf5e6]', // Saturday - OldLace
  'bg-[#f0ffff]'  // Sunday - Azure
];


  const getCurrentDayOfWeek = () => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  };

  const getCurrentMeal = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 17) return 'lunch';
    if (hour >= 17 && hour < 20) return 'snacks';
    return 'dinner';
  };

  const formatItems = (items: string) => {
    if (!items || items.trim() === '' || items === 'Menu not yet updated') {
      return ['Menu not available'];
    }
    return items.split(',').map(i => i.trim()).filter(i => i !== '');
  };

  const fetchMenuData = useCallback(async (studentId: string) => {
    try {
      console.log(user);
      const { data: hostelApp, error: hostelAppErr } = await supabase
        .from('hostel_applications_db')
        .select('hostel_id')
        .eq('student_id', studentId)
        .single();

      if (hostelAppErr || !hostelApp) throw new Error('No hostel application found');

      const { data: hostelData, error: hostelErr } = await supabase
        .from('hostel_db')
        .select('mess_id')
        .eq('hostel_id', hostelApp.hostel_id)
        .single();

      if (hostelErr || !hostelData) throw new Error('No mess assigned to your hostel');

      // Fetch mess name
      const { data: messData, error: messErr } = await supabase
        .from('mess_db')
        .select('name')
        .eq('mess_id', hostelData.mess_id)
        .single();

      if (messErr || !messData) throw new Error('Mess info not found');
      setMessName(messData.name);

      // Today's Menu
      const currentDay = getCurrentDayOfWeek();
      const { data: today, error: todayErr } = await supabase
        .from('mess_menu')
        .select('*')
        .eq('mess_id', hostelData.mess_id)
        .eq('day_of_week', currentDay)
        .single();

      if (todayErr || !today) throw new Error('Menu not available for today');
      setTodayMenu(today);

      // Weekly Menu
      const { data: week, error: weekErr } = await supabase
        .from('mess_menu')
        .select('*')
        .eq('mess_id', hostelData.mess_id)
        .order('day_of_week');

      if (weekErr || !week) throw new Error('Weekly menu not available');
      setWeeklyMenu(week);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('User not logged in');
      const parsedUser: User = JSON.parse(userData);
      if (!parsedUser || !parsedUser.id) throw new Error('Invalid user data');
      setUser(parsedUser);
      fetchMenuData(parsedUser.id);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }, [fetchMenuData]);

  const currentMeal = getCurrentMeal();
  const currentDay = getCurrentDayOfWeek();

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold text-[#800000] mb-1">
              {showWeekly ? 'Weekly Mess Menu' : "Today's Mess Menu"}
            </h2>
            {messName && (
              <p className="text-lg text-gray-600">Mess Name: <span className="font-semibold text-gray-800">{messName}</span></p>
            )}
          </div>
          <button
            onClick={() => setShowWeekly(!showWeekly)}
            className="px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#5a0000] transition"
          >
            {showWeekly ? 'Back to Today' : 'View Weekly Menu'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin h-10 w-10 border-4 border-t-transparent border-[#800000] rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center">{error}</div>
        ) : showWeekly ? (
          weeklyMenu.length > 0 ? (
            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-[#800000] text-white text-lg">
                  <tr>
                    <th className="p-4 border">Day</th>
                    <th className="p-4 border">Breakfast</th>
                    <th className="p-4 border">Lunch</th>
                    <th className="p-4 border">Snacks</th>
                    <th className="p-4 border">Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyMenu.map((menu) => (
                    <tr
                      key={menu.day_of_week}
                      className={`hover:bg-gray-100 ${dayColors[menu.day_of_week]} transition`}
                    >
                      <td className="p-4 font-semibold border text-center">
                        {dayNames[menu.day_of_week]}
                        {menu.day_of_week === currentDay && (
                          <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Today</span>
                        )}
                      </td>
                      {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((meal) => (
                        <td key={meal} className="p-4 border">
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {formatItems(menu[meal]).map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-600 mt-4">No weekly menu available.</div>
          )
        ) : (
          todayMenu && (
            <div className="space-y-6 mt-4">
              {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((meal) => (
                <div
                  key={meal}
                  className={`p-4 rounded-xl shadow-sm ${
                    currentMeal === meal ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-gray-50'
                  }`}
                >
                  <h3 className="text-xl font-semibold capitalize flex items-center text-[#333]">
                    {meal}
                    {currentMeal === meal && (
                      <span className="ml-3 bg-yellow-400 text-white text-xs px-3 py-1 rounded-full">
                        Now Serving
                      </span>
                    )}
                  </h3>
                  <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                    {formatItems(todayMenu[meal]).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
