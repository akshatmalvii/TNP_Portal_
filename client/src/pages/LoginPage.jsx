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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

        <Card className="shadow-lg">

          <CardHeader>
            <CardTitle>Login to Your Account</CardTitle>
            <CardDescription>
              Select your role and enter your credentials
            </CardDescription>
          </CardHeader>

          <CardContent>

            {/* <form onSubmit={handleLogin} className="space-y-4"> */}
<form  className="space-y-4">
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
                {isLoading ? "Logging in..." : "Login"}
              </Button>

            </form>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}