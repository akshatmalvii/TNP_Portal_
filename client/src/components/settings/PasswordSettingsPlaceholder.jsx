import React, { useMemo, useState } from "react";
import { Lock, KeyRound, Mail } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentUserEmail = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return "";
      const parsedUser = JSON.parse(rawUser);
      return parsedUser?.email || "";
    } catch {
      return "";
    }
  }, []);

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
          Manage your {roleLabel.toLowerCase()} password settings.
        </p>
      </div>

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
                  {currentUserEmail || "Account email not available"}
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
