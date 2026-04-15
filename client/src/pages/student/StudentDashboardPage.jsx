import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { API_BASE_URL } from '../constants/api';

const API_BASE = "`${API_BASE_URL}`/api/v1";

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    checkVerificationAndLoad();
  }, []);

  const checkVerificationAndLoad = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // First check profile and verification status
      const profileRes = await fetch(`${API_BASE}/student-profile/profile`, { headers });

      if (profileRes.ok) {
        const profile = await profileRes.json();

        // If profile not filled (no name), redirect to form
        if (!profile.full_name || !profile.dept_id || !profile.course_id) {
          navigate("/dashboard/student/profile-form");
          return;
        }

        // If no verification request, redirect to form
        if (!profile.StudentVerificationRequest) {
          navigate("/dashboard/student/profile-form");
          return;
        }

        // If verification pending or rejected, show pending page
        if (profile.StudentVerificationRequest.coordinator_status !== "Approved") {
          navigate("/dashboard/student/verification-pending");
          return;
        }
      }

      // Verified student — load dashboard data
      const [drivesRes, appsRes] = await Promise.all([
        fetch(`${API_BASE}/drives`, { headers }).catch(() => null),
        fetch(`${API_BASE}/drives/applications`, { headers }).catch(() => null),
      ]);

      if (drivesRes?.ok) setDrives(await drivesRes.json());
      if (appsRes?.ok) setApplications(await appsRes.json());

    } catch (error) {
      console.error("Dashboard load error", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Applications",
      value: applications.length,
      icon: Briefcase,
      color: "text-blue-500",
    },
    {
      title: "Selected",
      value: applications.filter((a) => a.application_status === "SELECTED").length,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "In Process",
      value: applications.filter((a) =>
        ["SHORTLISTED", "IN_PROGRESS"].includes(a.application_status)
      ).length,
      icon: AlertCircle,
      color: "text-yellow-500",
    },
    {
      title: "Pending Response",
      value: applications.filter((a) => a.application_status === "APPLIED").length,
      icon: Clock,
      color: "text-purple-500",
    },
  ];

  const recentApplications = applications.slice(0, 3);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "SELECTED":
        return "bg-green-100 text-green-700";
      case "SHORTLISTED":
        return "bg-yellow-100 text-yellow-700";
      case "APPLIED":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome! Here's your placement journey overview.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white shadow rounded-lg p-5">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-100">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-1">Recent Applications</h2>
          <p className="text-sm text-gray-500 mb-4">
            Your latest job applications and their status
          </p>

          <div className="space-y-3">
            {recentApplications.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                No applications yet. Browse drives to apply!
              </p>
            ) : (
              recentApplications.map((app) => (
                <div key={app.application_id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{app.Drive?.company_name || 'Unknown Company'}</h3>
                      <p className="text-sm text-gray-500">
                        Applied on {new Date(app.applied_at || app.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(app.application_status)}`}>
                      {app.application_status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link to="/dashboard/student/applications">
            <button className="w-full mt-4 border rounded py-2 hover:bg-gray-100">
              View All Applications
            </button>
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/dashboard/student/drives">
              <button className="w-full border rounded py-2 flex items-center justify-start px-3 hover:bg-gray-100">
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Job Drives
              </button>
            </Link>
            <Link to="/dashboard/student/profile">
              <button className="w-full border rounded py-2 flex items-center justify-start px-3 hover:bg-gray-100">
                <AlertCircle className="w-4 h-4 mr-2" />
                View Profile
              </button>
            </Link>
          </div>

          <div className="pt-4 mt-4 border-t">
            <h4 className="font-semibold mb-2">Available Drives</h4>
            <p className="text-2xl font-bold text-indigo-600">
              {Array.isArray(drives) ? drives.filter((d) => d.drive_status === "Active").length : 0}
            </p>
            <p className="text-xs text-gray-500">drives available to apply</p>
          </div>
        </div>
      </div>
    </div>
  );
}


