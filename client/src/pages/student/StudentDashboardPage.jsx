import React from "react";
import { Link } from "react-router-dom";
import { mockDrives, mockApplications } from "./mockDrives.js";
import { Briefcase, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function StudentDashboardPage() {
  const stats = [
    {
      title: "Total Applications",
      value: mockApplications.length,
      icon: Briefcase,
      color: "text-blue-500",
    },
    {
      title: "Selected",
      value: mockApplications.filter((a) => a.status === "Selected").length,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "Shortlisted",
      value: mockApplications.filter((a) => a.status === "Shortlisted").length,
      icon: AlertCircle,
      color: "text-yellow-500",
    },
    {
      title: "Pending Response",
      value: mockApplications.filter((a) => a.status === "Applied").length,
      icon: Clock,
      color: "text-purple-500",
    },
  ];

  const recentApplications = mockApplications.slice(0, 3);

  const getStatusColor = (status) => {
    switch (status) {
      case "Selected":
        return "bg-green-100 text-green-700";
      case "Shortlisted":
        return "bg-yellow-100 text-yellow-700";
      case "Applied":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome! Here's your placement journey overview.
        </p>
      </div>

      {/* Stats Cards */}
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

                <div className={`p-2 rounded-lg bg-gray-100`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-1">Recent Applications</h2>
          <p className="text-sm text-gray-500 mb-4">
            Your latest job applications and their status
          </p>

          <div className="space-y-3">
            {recentApplications.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                No applications yet
              </p>
            ) : (
              recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{app.company}</h3>
                      <p className="text-sm text-gray-500">
                        Applied on{" "}
                        {new Date(app.appliedDate).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-1 text-xs rounded ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-sm mt-3 font-medium">{app.result}</p>
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

        {/* Quick Actions */}
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
                Update Profile
              </button>
            </Link>
          </div>

          <div className="pt-4 mt-4 border-t">
            <h4 className="font-semibold mb-2">Available Drives</h4>

            <p className="text-2xl font-bold text-indigo-600">
              {mockDrives.filter((d) => d.status === "Open").length}
            </p>

            <p className="text-xs text-gray-500">
              drives available to apply
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}