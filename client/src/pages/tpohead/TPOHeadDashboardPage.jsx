import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/Card";
import { Building2, ShieldCheck, UserPlus, Users } from "lucide-react";

const API_BASE = "http://localhost:5000/api/v1";

export default function TPOHeadDashboardPage() {
  const [stats, setStats] = useState({
    departments: 0,
    tpos: 0,
    coordinators: 0,
    students: 0,
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [deptRes, staffRes] = await Promise.all([
        fetch(`${API_BASE}/departments`, { headers }),
        fetch(`${API_BASE}/admin/staff`, { headers }),
      ]);

      const departments = await deptRes.json();
      const staffList = await staffRes.json();

      const tpos = Array.isArray(staffList)
        ? staffList.filter(s => s.User?.Role?.role_name === "TPO").length
        : 0;
      const coordinators = Array.isArray(staffList)
        ? staffList.filter(s => s.User?.Role?.role_name === "Placement_Coordinator").length
        : 0;

      setStats({
        departments: Array.isArray(departments) ? departments.length : 0,
        tpos,
        coordinators,
        students: "—",
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Departments", value: stats.departments, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "TPOs", value: stats.tpos, icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Coordinators", value: stats.coordinators, icon: UserPlus, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Students", value: stats.students, icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">TPO Head Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Manage departments, staff, and placement operations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-0">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">
                      {loading ? "..." : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/dashboard/tpohead/departments" className="block p-4 border rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Manage Departments</p>
                  <p className="text-sm text-gray-500">Add, edit, or remove departments</p>
                </div>
              </div>
            </a>
            <a href="/dashboard/tpohead/tpos" className="block p-4 border rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Manage TPOs</p>
                  <p className="text-sm text-gray-500">Add TPOs and assign them to departments</p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardHeader>
            <CardTitle>System Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-xs text-gray-500">Logged in as</p>
              <p className="font-semibold text-indigo-700 mt-1">TPO Head</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-500">System Status</p>
              <p className="font-semibold text-green-600 mt-1">● Active</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
