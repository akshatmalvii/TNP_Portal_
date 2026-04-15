import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { Button } from "./Button";
import { API_BASE_URL } from "../constants/api";

export default function DashboardHeader({ userName, userRole, onMenuClick }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const token = localStorage.getItem("token");
  const isStudent = userRole === "student";

  const getNotificationTone = (notificationType) => {
    switch (notificationType) {
      case "FINAL_SELECTION":
        return "bg-green-50 border-green-100";
      case "FINAL_REJECTION":
        return "bg-red-50 border-red-100";
      case "ROUND_SCHEDULE":
        return "bg-indigo-50 border-indigo-100";
      default:
        return "bg-amber-50 border-amber-100";
    }
  };

  const fetchNotifications = async () => {
    if (!isStudent || !token) return;

    setLoadingNotifications(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/notifications/me?limit=4`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(Number(data.unreadCount || 0));
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!isStudent || !token || unreadCount === 0) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/notifications/me/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      setNotifications((current) =>
        current.map((notification) => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  const openNotificationsPage = () => {
    setShowNotifications(false);
    navigate("/dashboard/student/notifications");
  };

  useEffect(() => {
    if (isStudent) {
      fetchNotifications();
    }
  }, [isStudent]);

  useEffect(() => {
    if (showNotifications && isStudent) {
      fetchNotifications();
    }
  }, [showNotifications, isStudent]);

  const getRoleLabel = () => {
    switch (userRole) {
      case "student":
        return "Student";
      case "coordinator":
        return "Student Coordinator";
      case "tpo":
        return "TPO";
      case "tpohead":
        return "TPO Head";
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
            {isStudent && unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-50">

              <div className="p-4 border-b flex items-center justify-between gap-3">
                <h3 className="font-semibold">Notifications</h3>
                <div className="flex items-center gap-3">
                  {isStudent && unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Mark all as read
                    </button>
                  )}
                  {isStudent && (
                    <button
                      onClick={openNotificationsPage}
                      className="text-xs font-medium text-gray-600 hover:text-gray-900"
                    >
                      View all
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                {!isStudent ? (
                  <div className="p-3 bg-gray-50 border rounded">
                    <p className="text-sm font-medium">No notifications configured</p>
                    <p className="text-xs text-gray-500">
                      Portal notifications are currently student-facing.
                    </p>
                  </div>
                ) : loadingNotifications ? (
                  <div className="p-3 bg-gray-50 border rounded">
                    <p className="text-sm text-gray-500">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-3 bg-gray-50 border rounded">
                    <p className="text-sm font-medium">No notifications yet</p>
                    <p className="text-xs text-gray-500">
                      Round updates and results for your applied drives will appear here.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.notification_id}
                      onClick={openNotificationsPage}
                      className={`w-full p-3 border rounded text-left ${getNotificationTone(notification.notification_type)}`}
                    >
                      <div className="flex items-start justify-between gap-3 text-left">
                        <div>
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-1 leading-5 max-h-10 overflow-hidden">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>

              {isStudent && notifications.length > 0 && (
                <div className="border-t px-4 py-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={openNotificationsPage}
                  >
                    Open Notifications Page
                  </Button>
                </div>
              )}
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




