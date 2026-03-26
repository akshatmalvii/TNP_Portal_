import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import {
  Briefcase,
  TrendingUp,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TPODashboard() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/v1/tpo/drives", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setDrives(await res.json());
    } catch (err) {
      console.error("Failed to load drives", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Drives Posted",
      value: drives.length,
      icon: Briefcase,
      color: "text-blue-500",
    },
    {
      title: "Students Placed",
      value: "0*", // Analytics pending
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "Avg. Salary",
      value: "0 LPA", // Analytics pending
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "Active Drives",
      value: drives.filter(d => d.drive_status === "OPEN" || d.drive_status === "Active").length,
      icon: Building2,
      color: "text-orange-500",
    },
  ];

  const pendingApprovals = []; // TBD based on new company creation workflows

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          TPO Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage placements, drives, and company relationships.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-0 bg-card">
              <CardContent className="pt-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-lg ${stat.color} opacity-20`}
                  >
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals */}
        <Card className="lg:col-span-2 border-0 bg-card">
          <CardHeader>
            <CardTitle>Pending Company Approvals</CardTitle>
            <CardDescription>
              Company requests awaiting approval
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending approvals
                </p>
              ) : (
                pendingApprovals.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 border rounded-lg hover:bg-secondary/20"
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold">
                        {req.company}
                      </h3>

                      <Badge className="bg-yellow-500/10 text-yellow-700 border border-yellow-200">
                        Pending
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {req.position}
                    </p>

                    <p className="text-sm font-medium text-primary mt-2">
                      {req.salary}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Approve
                      </Button>
                      <Button variant="outline">
                        Request Changes
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link to="/dashboard/tpo/approvals">
              <Button variant="outline" className="w-full mt-4">
                View All Requests
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Overview */}
        <Card className="border-0 bg-card">
          <CardHeader>
            <CardTitle>Placement Overview</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg border">
              <p className="text-xs text-muted-foreground">
                Placement %
              </p>
              <p className="text-3xl font-bold text-primary mt-1">
                N/A
              </p>
            </div>

            <div className="p-4 bg-accent/10 rounded-lg border">
              <p className="text-xs text-muted-foreground">
                Highest Salary
              </p>
              <p className="text-2xl font-bold mt-1">
                N/A
              </p>
            </div>

            <Link to="/dashboard/tpo/analytics">
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Drives */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle>Active Job Drives</CardTitle>
          <CardDescription>
            Currently ongoing recruitment drives
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {drives.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active drives.
              </p>
            ) : (
              drives.slice(0, 3).map((drive) => (
              <div
                key={drive.drive_id || drive.id}
                className="p-4 border rounded-lg hover:bg-secondary/20"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {drive.company_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {drive.role_title}
                    </p>
                  </div>

                  <Badge
                    className={
                      (drive.drive_status || "") === "OPEN"
                        ? "bg-green-500/10 text-green-700 border border-green-200"
                        : "bg-gray-500/10 text-gray-700 border border-gray-200"
                    }
                  >
                    {drive.drive_status || "Closed"}
                  </Badge>
                </div>
              </div>
            )))}
          </div>

          <Link to="/dashboard/tpo/drives">
            <Button variant="outline" className="w-full mt-4">
              Manage Drives
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}