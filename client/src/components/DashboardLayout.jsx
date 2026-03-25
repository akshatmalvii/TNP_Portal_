import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Read role from localStorage (set during login)
  const storedRole = localStorage.getItem("role") || "";

  // Map role_name to sidebar key
  const getRoleKey = () => {
    switch (storedRole) {
      case "TPO_Head": return "tpohead";
      case "TPO": return "tpo";
      case "Placement_Coordinator": return "coordinator";
      case "Student":
      default: return "student";
    }
  };

  const userRole = getRoleKey();

  // Get display name
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = storedUser.email || "User";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
        <Sidebar userRole={userRole} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          userName={userName}
          userRole={userRole}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}