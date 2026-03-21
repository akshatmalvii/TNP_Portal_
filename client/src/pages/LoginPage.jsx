import React, { useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "../components/Card";

export default function LoginPage() {
//   const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // const handleLogin = async (e) => {
  //   e.preventDefault();

  //   if (!email || !password || !selectedRole) {
  //     alert("Please fill all fields and select a role");
  //     return;
  //   }

  //   setIsLoading(true);

  //   setTimeout(() => {
  //     localStorage.setItem(
  //       "user",
  //       JSON.stringify({
  //         email,
  //         role: selectedRole,
  //         name: email.split("@")[0]
  //       })
  //     );

  //   //   navigate(`/dashboard/${selectedRole}`);
  //   }, 500);
  // };

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
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                isLogin
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
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
                ? "Select your role and enter your credentials"
                : "Enter your details to create a student account"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>

            {/* <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4"> */}
<form  className="space-y-4">
              {isLogin ? (
                <>
                  {/* Role Selection */}
                  <div className="grid grid-cols-3 gap-2">
                    {["student", "coordinator", "TPO"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition 
                        ${
                          selectedRole === role
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </button>
                    ))}
                  </div>

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
                  </div>
                </>
              ) : (
                <>
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

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
                  </div>

                  {/* Confirm Password */}
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
                </>
              )}

              {/* Demo Credentials */}
              {/* <div className="bg-gray-100 border rounded-lg p-3 text-xs">
                <p className="font-semibold mb-2">
                  Demo Credentials
                </p>

                <p>Email: demo@example.com</p>
                <p>Password: demo123</p>
              </div> */}

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