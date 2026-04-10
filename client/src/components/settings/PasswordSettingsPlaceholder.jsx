import React, { useEffect, useMemo, useState } from "react";
import { Lock, KeyRound, Mail, Save, UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Card";
import { Button } from "../Button";

const API_BASE = "http://localhost:5000/api/v1";

export default function PasswordSettingsPlaceholder({ roleLabel = "account" }) {
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [fullName, setFullName] = useState("");

  const storedRole = useMemo(() => localStorage.getItem("role") || "", []);
  const isStaffUser = storedRole && storedRole !== "Student";

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const [currentUser, setCurrentUser] = useState(storedUser);

  const currentUserEmail = currentUser?.email || "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setProfileLoading(false);
      return;
    }

    const fetchCurrentUser = async () => {
      setProfileLoading(true);
      setProfileError("");
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load your account details");
        }

        setCurrentUser(data);
        setFullName(data.full_name || "");
        localStorage.setItem("user", JSON.stringify(data));
        window.dispatchEvent(new Event("tnp-user-updated"));
      } catch (err) {
        setProfileError(err.message);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSaveName = async () => {
    const token = localStorage.getItem("token");
    setProfileError("");
    setNameSuccess("");

    if (!token) {
      setProfileError("You need to log in again before updating your name.");
      return;
    }

    if (!fullName.trim()) {
      setProfileError("Please enter your full name.");
      return;
    }

    setSavingName(true);
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: fullName }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update your name");
      }

      setCurrentUser(data.user);
      setFullName(data.user.full_name || "");
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("tnp-user-updated"));
      setNameSuccess(data.message || "Your name has been updated successfully.");
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingName(false);
    }
  };

  const handleSendResetLink = async () => {
    setError("");
    setSuccess("");

    if (!currentUserEmail) {
      setError("Could not find your account email. Please use the Forgot Password page.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserEmail }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset link");
      }

      setSuccess(
        data.message || "A password reset link has been sent to your email."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your {roleLabel.toLowerCase()} settings.
        </p>
      </div>

      {isStaffUser && (
        <Card className="border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="w-5 h-5 text-blue-600" />
              Staff Name
            </CardTitle>
            <CardDescription>
              Set the name that should appear in approvals, reports, and audit records.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!profileLoading && currentUser?.name_completed === false && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Your name is still missing. Staff actions are locked until you save it here.
              </div>
            )}

            {profileError && (
              <div className="p-3 rounded-md text-sm bg-red-100 text-red-700">
                {profileError}
              </div>
            )}

            {nameSuccess && (
              <div className="p-3 rounded-md text-sm bg-green-100 text-green-700">
                {nameSuccess}
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="e.g. Dr. Asha Patel"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <Button
              className="w-full justify-start gap-2"
              onClick={handleSaveName}
              disabled={savingName || profileLoading}
            >
              <Save className="w-4 h-4" />
              {savingName ? "Saving Name..." : "Save Name"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Password
          </CardTitle>
          <CardDescription>
            Send a standard password reset link to the email connected to your
            account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 mt-0.5 text-blue-700" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Reset link destination
                </p>
                <p className="mt-1 text-sm text-blue-700">
                  {profileLoading ? "Loading account email..." : currentUserEmail || "Account email not available"}
                </p>
              </div>
            </div>
          </div>

          {success && (
            <div className="p-3 rounded-md text-sm bg-green-100 text-green-700">
              {success}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-md text-sm bg-red-100 text-red-700">
              {error}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleSendResetLink}
            disabled={loading}
          >
            <KeyRound className="w-4 h-4" />
            {loading ? "Sending Reset Link..." : "Send Reset Link"}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
