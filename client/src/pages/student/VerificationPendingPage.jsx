import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/Card";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "../../components/Button";

const API_BASE = "http://localhost:5000/api/v1/student-profile";

export default function VerificationPendingPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const vr = data.StudentVerificationRequest;

        if (!vr) {
          // No verification request — go back to form
          navigate("/dashboard/student/profile-form");
          return;
        }

        if (vr.coordinator_status === "Approved") {
          // Verified! Go to dashboard
          navigate("/dashboard/student");
          return;
        }

        setStatus(vr);
      }
    } catch (err) {
      console.error("Error:", err);
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

  const isRejected = status?.coordinator_status === "Rejected";

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-6">
      <Card className="border-0 max-w-lg w-full text-center">
        <CardContent className="py-12 space-y-6">
          {isRejected ? (
            <>
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verification Rejected</h2>
              <p className="text-gray-500 max-w-sm mx-auto">
                Your verification request was rejected by the coordinator.
                Please update your profile/documents and contact your department coordinator.
              </p>
              <Button onClick={() => navigate("/dashboard/student/profile-form")}>
                Update Profile
              </Button>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
                  <Clock className="w-10 h-10 text-yellow-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verification Pending</h2>
              <p className="text-gray-500 max-w-sm mx-auto">
                Your profile has been submitted for verification.
                The coordinator will review your documents and approve your account.
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-600">Coordinator: <strong>{status?.coordinator_status}</strong></span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                You will be able to access placement drives once your profile is verified.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
