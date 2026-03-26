import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const API_BASE = "http://localhost:5000/api/v1/student-profile";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(true); // default true for non-students
  const [checkingVerification, setCheckingVerification] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Read role from localStorage (set during login)
  const storedRole = localStorage.getItem("role") || "";
  const token = localStorage.getItem("token");

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

  // Check verification status for students
  useEffect(() => {
    if (userRole !== "student") return;
    setCheckingVerification(true);

    const checkVerification = async () => {
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const vr = data.StudentVerificationRequest;

          if (vr && vr.coordinator_status === "Approved") {
            setIsVerified(true);
          } else {
            setIsVerified(false);
            // Redirect to appropriate page if not on allowed pages
            const allowedPaths = [
              "/dashboard/student/profile-form",
              "/dashboard/student/verification-pending",
            ];
            if (!allowedPaths.includes(location.pathname)) {
              if (!vr) {
                navigate("/dashboard/student/profile-form");
              } else {
                navigate("/dashboard/student/verification-pending");
              }
            }
          }
        }
      } catch (err) {
        console.error("Verification check error:", err);
      } finally {
        setCheckingVerification(false);
      }
    };

    checkVerification();
  }, [userRole, location.pathname]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
        <Sidebar userRole={userRole} isVerified={isVerified} />
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