import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "../components/Card";
import { API_BASE_URL } from "../constants/api";
import { PASSWORD_POLICY_RULES, validatePasswordStrength } from "../lib/passwordPolicy";
import { setAccessToken } from "../lib/setupAuthFetch";

export default function LoginPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const getRoleDashboardPath = (role) => {
    switch (role) {
      case "TPO_Head":
        return "/dashboard/tpohead";
      case "TPO":
        return "/dashboard/tpo";
      case "Placement_Coordinator":
        return "/dashboard/coordinator";
      case "Student":
      default:
        return "/dashboard/student";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Login failed");
      }

      setAccessToken(data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("tnp-user-updated"));

      navigate(getRoleDashboardPath(data.role));
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password || !confirmPassword) {
      setErrorMsg("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    const passwordValidationError = validatePasswordStrength({ password, email });
    if (passwordValidationError) {
      setErrorMsg(passwordValidationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Sign up failed");
      }

      setIsLogin(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setErrorMsg("Account created! Please login.");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="w-full max-w-md">

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            TNP Portal
          </h1>
          <p className="text-gray-500">
            Training & Placement Management System
          </p>
        </div>

        {/* Toggle between Login and Sign Up */}
        <div className="mb-6 flex justify-center">
          <div className="bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => { setIsLogin(true); setErrorMsg(""); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                isLogin
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setErrorMsg(""); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                !isLogin
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <Card className="shadow-lg">

          <CardHeader>
            <CardTitle>{isLogin ? "Login to Your Account" : "Create Student Account"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to continue"
                : "Enter your details to create a student account"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errorMsg && (
              <div className={`p-3 rounded-md text-sm mb-4 ${errorMsg.includes('created') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">

              {/* Email */}
              <div>
                <label className="text-sm font-medium">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {isLogin && (
                  <div className="mt-2 text-right">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>

              {/* Confirm Password (Sign Up only) */}
              {!isLogin && (
                <>
                <div>
                  <label className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="rounded-md bg-blue-50 border border-blue-100 p-3 text-xs text-blue-900">
                  <p className="font-medium mb-2">Password rules</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {PASSWORD_POLICY_RULES.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
                </>
              )}

              {/* Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (isLogin ? "Logging in..." : "Signing up...") : (isLogin ? "Login" : "Sign Up")}
              </Button>

            </form>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}





