"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase/supabaseClient";

export default function AdminDashboard() {
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState({
    totalApplications: 0,
    occupiedRooms: 0,
    pendingComplaints: 0,
    totalRevenue: 0,
    loading: true,
  });

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    router.push("/");
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { count: applicationsCount } = await supabase
          .from("hostel_applications")
          .select("*", { count: "exact", head: true });

        const { count: occupiedRoomsCount } = await supabase
          .from("rooms")
          .select("*", { count: "exact", head: true })
          .gt("occupants", 0);

        const { count: pendingComplaintsCount } = await supabase
          .from("grievances")
          .select("*", { count: "exact", head: true })
          .eq("status", "Pending");

        const { data: paidApplications } = await supabase
          .from("hostel_applications")
          .select("id")
          .eq("hostel_fees_status", "Paid");

        const avgHostelFee = 50000;
        const totalRevenue = (paidApplications?.length || 0) * avgHostelFee;

        setDashboardStats({
          totalApplications: applicationsCount || 0,
          occupiedRooms: occupiedRoomsCount || 0,
          pendingComplaints: pendingComplaintsCount || 0,
          totalRevenue: totalRevenue,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setDashboardStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardStats();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const sections = [
    {
      title: "Hostel Management",
      description: "Manage student applications, room allotments, and hostel infrastructure",
      icon: "🏠",
      color: "from-red-500 to-red-800",
      items: [
        { name: "Review Applications", path: "/Admin/HostelManagement/ReviewApplications", icon: "📋" },
        { name: "Generate Merit List", path: "/Admin/HostelManagement/GenerateMeritList", icon: "📊" },
        { name: "Room Allotment", path: "/Admin/HostelManagement/RoomAllotment", icon: "🏠" },
        { name: "Review Allotment", path: "/Admin/HostelManagement/ReviewAllotment", icon: "✅" },
        { name: "Manage Infrastructure", path: "/Admin/HostelManagement/ManageInfrastructure", icon: "🔧" },
        { name: "Vacancy", path: "/Admin/HostelManagement/Vacancy", icon: "📈" },
        { name: "Seat Matrix", path: "/Admin/HostelManagement/SeatMatrix", icon: "📋" },
        { name: "Hostel ID Card", path: "/Admin/HostelManagement/HostelIDCard", icon: "🆔" },
      ],
    },
    {
      title: "Grievances",
      description: "Handle complaints and grievances from students",
      icon: "📞",
      color: "from-red-500 to-red-800",
      items: [
        { name: "Hostel Complaints", path: "/Admin/GrievancesManagement/HostelComplaints", icon: "🏠" },
        { name: "Mess Complaints", path: "/Admin/GrievancesManagement/MessComplaints", icon: "🍽" },
        { name: "General Complaints", path: "/Admin/GrievancesManagement/GeneralComplaints", icon: "📝" },
        { name: "Track Complaint Status", path: "/Admin/GrievancesManagement/TrackComplaintStatus", icon: "📍" },
        { name: "Room Change Requests", path: "/Admin/GrievancesManagement/RoomChangeRequests", icon: "🔄" },
      ],
    },
    {
      title: "Mess Management",
      description: "Manage mess operations, menus, and payments",
      icon: "🍽",
      color: "from-red-500 to-red-800",
      items: [
        { name: "Update Mess Menu", path: "/Admin/MessManagement/UpdateMenu", icon: "📋" },
        { name: "Manage Payments", path: "/Admin/MessManagement/ManagePayments", icon: "💳" },
        { name: "Mess Revenue", path: "/Admin/MessManagement/PaymentBlockwise", icon: "📊" },
        { name: "Hostel Revenue", path: "/Admin/MessManagement/RevenueHostelBlockWise", icon: "📊" },
        { name: "Mess Change", path: "/Admin/MessManagement/MessChange", icon: "📊" },
      ],
    },
    {
      title: "Notices",
      description: "Generate notices and upload them",
      icon: "🔔",
      color: "from-red-500 to-red-800",
      items: [
        { name: "Generate Notice", path: "/Admin/NoticeManagement/GenerateNotice", icon: "📄" },
        { name: "View Notices", path: "/Admin/NoticeManagement/EditNotice", icon: "📝" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Image src="/images/vjti_logo.svg" alt="VJTI Logo" width={50} height={50} className="rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-[#800000]">Veermata Jijabai Technological Institute</h1>
                <p className="text-sm text-gray-600">Matunga East, Mumbai, Maharashtra 400019</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Welcome, Admin</span>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage hostel operations, student grievances, mess services, and notices.</p>
        </div>

        <div className="space-y-12">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className={`bg-gradient-to-r ${section.color} px-6 py-4`}>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{section.title}</h3>
                    <p className="text-white/90 text-sm">{section.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {section.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigateTo(item.path)}
                    className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{item.name}</h4>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Applications", value: dashboardStats.totalApplications, icon: "📋", border: "border-blue-500" },
            { label: "Occupied Rooms", value: dashboardStats.occupiedRooms, icon: "🏠", border: "border-green-500" },
            { label: "Pending Complaints", value: dashboardStats.pendingComplaints, icon: "⚠", border: "border-orange-500" },
            { label: "Total Revenue", value: formatCurrency(dashboardStats.totalRevenue), icon: "💰", border: "border-purple-500" },
          ].map((stat, idx) => (
            <div key={idx} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${stat.border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.loading ? <span className="animate-pulse bg-gray-200 rounded w-16 h-6 block"></span> : stat.value}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gray-100 text-xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16 text-center text-gray-500 text-sm py-6">
        &copy; 2024 Veermata Jijabai Technological Institute. All rights reserved.
      </footer>
    </div>
  );
}
