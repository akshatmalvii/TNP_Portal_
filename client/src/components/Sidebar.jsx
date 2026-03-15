import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  FileText,
  LogOut,
  Settings,
  Users,
  Building2,
  Briefcase,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function Sidebar({ userRole }) {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     navigate("/");
//   };

  const studentMenuItems = [
    { href: "/dashboard/student", label: "Dashboard", icon: BarChart3 },
    { href: "/dashboard/student/drives", label: "Job Drives", icon: Briefcase },
    { href: "/dashboard/student/applications", label: "My Applications", icon: FileText },
    { href: "/dashboard/student/profile", label: "My Profile", icon: Users },
  ];

  const coordinatorMenuItems = [
    { href: "/dashboard/coordinator", label: "Dashboard", icon: BarChart3 },
    { href: "/dashboard/coordinator/students", label: "Students", icon: Users },
    { href: "/dashboard/coordinator/verifications", label: "Verifications", icon: CheckCircle2 },
    { href: "/dashboard/coordinator/pending", label: "Pending", icon: Clock },
  ];

  const tpoMenuItems = [
    { href: "/dashboard/tpo", label: "Dashboard", icon: BarChart3 },
    { href: "/dashboard/tpo/drives", label: "Job Drives", icon: Briefcase },
    { href: "/dashboard/tpo/companies", label: "Companies", icon: Building2 },
    { href: "/dashboard/tpo/approvals", label: "Approvals", icon: CheckCircle2 },
    { href: "/dashboard/tpo/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const menuItems =
    userRole === "student"
      ? studentMenuItems
      : userRole === "coordinator"
      ? coordinatorMenuItems
      : tpoMenuItems;

  const isActive = (href) => location.pathname === href;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white w-64">

      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        {/* <Link to={`/dashboard/${userRole}`} className="flex items-center gap-3"> */}
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="font-bold">TNP</h1>
            <p className="text-xs text-gray-400">Portal</p>
          </div>
        {/* </Link> */}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            // <Link key={item.href} to={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition ${
                  active
                    ? "bg-indigo-600"
                    : "hover:bg-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            // </Link>
          );
        })}
      </nav>

      {/* Settings + Logout */}
      <div className="p-4 border-t border-gray-700 space-y-2">

        {/* <Link to={`/dashboard/${userRole}/settings`}> */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </div>
        {/* </Link> */}

        <button
        //   onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>

      </div>
    </div>
  );
}