import React, { useEffect, useState } from "react";
import { Bell, BellRing, Briefcase, CalendarDays, CheckCircle2, Filter, MapPin, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/Card";
import { Button } from "../../components/Button";
import { API_BASE_URL } from '../../constants/api';

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "ROUND_SCHEDULE", label: "Round Updates" },
  { id: "ROUND_RESULT", label: "Round Results" },
  { id: "FINAL_SELECTION", label: "Selected" },
  { id: "FINAL_REJECTION", label: "Rejected" },
];

const getNotificationTone = (notificationType) => {
  switch (notificationType) {
    case "FINAL_SELECTION":
      return {
        card: "border-green-200 bg-green-50",
        iconBg: "bg-green-100 text-green-600",
        label: "Final Selection",
        Icon: CheckCircle2,
      };
    case "FINAL_REJECTION":
      return {
        card: "border-red-200 bg-red-50",
        iconBg: "bg-red-100 text-red-600",
        label: "Final Result",
        Icon: XCircle,
      };
    case "ROUND_SCHEDULE":
      return {
        card: "border-blue-200 bg-blue-50",
        iconBg: "bg-blue-100 text-blue-600",
        label: "Round Schedule",
        Icon: CalendarDays,
      };
    case "ROUND_RESULT":
      return {
        card: "border-amber-200 bg-amber-50",
        iconBg: "bg-amber-100 text-amber-600",
        label: "Round Result",
        Icon: BellRing,
      };
    default:
      return {
        card: "border-gray-200 bg-gray-50",
        iconBg: "bg-gray-100 text-gray-600",
        label: "Notification",
        Icon: Bell,
      };
  }
};

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/notifications/me?limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch notifications");
      }

      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(Number(data.unreadCount || 0));
      setError("");
    } catch (err) {
      setError(err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    setMarkingRead(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/notifications/me/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to mark notifications as read");
      }

      setNotifications((current) =>
        current.map((notification) => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setMarkingRead(false);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.is_read;
    return notification.notification_type === filter;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            Round schedules, shortlist updates, and final drive outcomes for your applications.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border bg-white px-4 py-3 min-w-[140px]">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
          </div>
          <div className="rounded-xl border bg-white px-4 py-3 min-w-[140px]">
            <p className="text-xs text-gray-500">Unread</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{unreadCount}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md text-sm bg-red-100 text-red-700">
          {error}
        </div>
      )}

      <Card className="border-0">
        <CardHeader className="gap-4 lg:flex lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Notification Feed
            </CardTitle>
            <CardDescription>
              Use filters to focus on unread items or a specific type of update.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={markingRead || unreadCount === 0}
          >
            {markingRead ? "Marking..." : "Mark All Read"}
          </Button>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <Button
                key={item.id}
                variant={filter === item.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
              No notifications found for this filter.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const tone = getNotificationTone(notification.notification_type);
                const Icon = tone.Icon;

                return (
                  <div
                    key={notification.notification_id}
                    className={`rounded-2xl border p-5 ${tone.card}`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone.iconBg}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            <span className="rounded-full border border-white/80 bg-white/80 px-2 py-1 text-[11px] font-medium text-gray-600">
                              {tone.label}
                            </span>
                            {!notification.is_read && (
                              <span className="rounded-full bg-blue-600 px-2 py-1 text-[11px] font-medium text-white">
                                Unread
                              </span>
                            )}
                          </div>

                          <p className="text-sm leading-6 text-gray-700">
                            {notification.message}
                          </p>

                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="w-3.5 h-3.5" />
                              {new Date(notification.created_at).toLocaleString()}
                            </span>

                            {notification.Drive?.Company?.company_name && (
                              <span className="inline-flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5" />
                                {notification.Drive.Company.company_name}
                              </span>
                            )}

                            {notification.DriveRound?.round_name && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                Round {notification.DriveRound.round_number}: {notification.DriveRound.round_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}






