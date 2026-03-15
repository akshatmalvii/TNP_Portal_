import React, { useState } from "react";
import { Bell, Menu } from "lucide-react";

export default function DashboardHeader({ userName, userRole, onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleLabel = () => {
    switch (userRole) {
      case "student":
        return "Student";
      case "coordinator":
        return "Placement Coordinator";
      case "tpo":
        return "TPO Administrator";
      default:
        return "User";
    }
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">

      {/* Left Section */}
      <div className="flex items-center gap-4">

        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg font-semibold">
            Welcome, {userName}!
          </h2>

          <p className="text-xs text-gray-500">
            {getRoleLabel()}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <div className="relative">

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded hover:bg-gray-100"
          >
            <Bell className="w-5 h-5" />

            {/* Notification dot */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg z-50">

              <div className="p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
              </div>

              <div className="max-h-80 overflow-y-auto p-4 space-y-3">

                <div className="p-3 bg-orange-50 border rounded">
                  <p className="text-sm font-medium">
                    New job drive posted
                  </p>
                  <p className="text-xs text-gray-500">
                    TechCorp Solutions is hiring
                  </p>
                </div>

                <div className="p-3 bg-indigo-50 border rounded">
                  <p className="text-sm font-medium">
                    Application shortlisted
                  </p>
                  <p className="text-xs text-gray-500">
                    You've been shortlisted at DataFlow Systems
                  </p>
                </div>

                <div className="p-3 bg-gray-100 border rounded">
                  <p className="text-sm font-medium">
                    Interview scheduled
                  </p>
                  <p className="text-xs text-gray-500">
                    Interview on 20 Apr at 2:00 PM
                  </p>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="hidden sm:flex items-center gap-3 pl-4 border-l">

          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
            {/* {userName.charAt(0).toUpperCase()} */}
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-medium">
              {userName}
            </p>
            <p className="text-xs text-gray-500">
              {getRoleLabel()}
            </p>
          </div>

        </div>

      </div>
    </header>
  );
}