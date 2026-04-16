import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  FileText,
  LogOut,
  Settings,
  Users,
  Building2,
  Briefcase,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserPlus,
  LayoutDashboard,
  Landmark,
  Plus,
  CalendarClock,
} from "lucide-react";
import { confirmDialogIcons, useConfirmDialog } from "./ConfirmDialog";

export default function Sidebar({ userRole, isVerified = true }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { confirm, confirmDialog } = useConfirmDialog();

  const handleLogout = async () => {
    const shouldLogout = await confirm({
      title: "Logout from your account?",
      description: "You will need to log in again to access the portal.",
      confirmText: "Logout",
      tone: "neutral",
      icon: confirmDialogIcons.logout,
    });

    if (!shouldLogout) return;

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    navigate("/");
  };

  const studentMenuItems = [
    { href: "/dashboard/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/student/drives", label: "Job Drives", icon: Briefcase },
    { href: "/dashboard/student/applications", label: "My Applications", icon: FileText },
    { href: "/dashboard/student/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/student/offer-letter", label: "Offer Letter", icon: ShieldCheck },
    { href: "/dashboard/student/profile", label: "My Profile", icon: Users },
  ];

  const coordinatorMenuItems = [
    { href: "/dashboard/coordinator/students", label: "Students", icon: Users },
    { href: "/dashboard/coordinator/verifications", label: "Verifications", icon: CheckCircle2 },
    { href: "/dashboard/coordinator/create-drive", label: "Create Drive", icon: Plus },
    { href: "/dashboard/coordinator/drive-updates", label: "Upload Drive Results", icon: Briefcase },
    { href: "/dashboard/coordinator/companies", label: "Companies", icon: Building2 },
  ];

  const tpoMenuItems = [
    { href: "/dashboard/tpo/coordinators", label: "Manage Coordinators", icon: UserPlus },
    { href: "/dashboard/tpo/placement-season", label: "Placement Season", icon: CalendarClock },
    { href: "/dashboard/tpo/policy", label: "Placement Policy", icon: Landmark },
    { href: "/dashboard/tpo/drives", label: "Job Drives", icon: Briefcase },
    { href: "/dashboard/tpo/companies", label: "Companies", icon: Building2 },
    { href: "/dashboard/tpo/approvals", label: "Approvals", icon: CheckCircle2 },
    { href: "/dashboard/tpo/offer-letters", label: "Offer Letters", icon: ShieldCheck },
    { href: "/dashboard/tpo/reports", label: "Reports", icon: FileText },
  ];

  const tpoHeadMenuItems = [
    { href: "/dashboard/tpohead", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/tpohead/departments", label: "Departments", icon: Building2 },
    { href: "/dashboard/tpohead/tpos", label: "Manage TPOs", icon: ShieldCheck },
    { href: "/dashboard/tpohead/reports", label: "Reports", icon: BarChart3 },
  ];

  const getMenuItems = () => {
    switch (userRole) {
      case "tpohead": return tpoHeadMenuItems;
      case "tpo": return tpoMenuItems;
      case "coordinator": return coordinatorMenuItems;
      default: return studentMenuItems;
    }
  };

  const menuItems = getMenuItems();
  const basePath = `/dashboard/${userRole}`;

  const isActive = (href) => location.pathname === href;

  const getRoleLabel = () => {
    switch (userRole) {
      case "tpohead": return "TPO Head";
      case "tpo": return "TPO";
      case "coordinator": return "Coordinator";
      default: return "Student";
    }
  };

  // For unverified students, disable all nav links
  const isLocked = userRole === "student" && !isVerified;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white w-64">

      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <Link to={basePath} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="font-bold">TNP</h1>
            <p className="text-xs text-gray-400">Portal</p>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-6 py-3 border-b border-gray-700">
        <span className="text-xs font-medium px-2 py-1 bg-indigo-600/20 text-indigo-300 rounded-md">
          {getRoleLabel()}
        </span>
        {isLocked && (
          <span className="ml-2 text-xs font-medium px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded-md">
            Not Verified
          </span>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (isLocked) {
            // Render as disabled, non-clickable div
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-not-allowed opacity-40"
                title="Complete verification to unlock"
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            );
          }

          return (
            <Link key={item.href} to={item.href}>
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
            </Link>
          );
        })}
      </nav>

      {/* Settings + Logout */}
      <div className="p-4 border-t border-gray-700 space-y-2">

        <Link to={`${basePath}/settings`}>
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>

      </div>

      {confirmDialog}
    </div>
  );
}





