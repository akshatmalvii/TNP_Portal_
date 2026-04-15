import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Users, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from '../../constants/api';

export default function CoordinatorDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/v1/verification/coordinator/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (err) {
        console.error("Failed to fetch students", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const totalStudents = students.length;
  // Placeholders pending Offer module
  const totalPlaced = 0;
  const placementPercentage = totalStudents > 0 ? ((totalPlaced / totalStudents) * 100).toFixed(1) : 0;
  
  const pendingVerifications = students.filter(
    (s) => s.StudentVerificationRequest?.coordinator_status === "Pending"
  );

  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Placed Students",
      value: totalPlaced,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "Pending Verifications",
      value: pendingVerifications.length,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Placement %",
      value: `${placementPercentage}%`,
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ];

  const recentVerifications = pendingVerifications.slice(0, 3);

  const getStatusText = (student) => {
    const vr = student.StudentVerificationRequest;
    if (!vr) return "Not Verified";
    if (vr.coordinator_status === "Pending") return "Pending Review";
    if (vr.coordinator_status === "Approved") return "Verified";
    if (vr.coordinator_status === "Rejected") return "Rejected";
    return "Unknown";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Verified":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "Pending Review":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "Rejected":
        return "bg-red-500/10 text-red-700 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Coordinator Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of placements and student applications.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-0 bg-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.color} opacity-20`}>
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
        {/* Pending Verifications */}
        <Card className="lg:col-span-2 border-0 bg-card">
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>
              Applications awaiting coordinator review
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {recentVerifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending verifications
                </p>
              ) : (
                recentVerifications.map((app) => (
                  <div
                    key={app.student_id}
                    className="p-4 border border-border rounded-lg hover:bg-secondary/20 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {app.full_name || "N/A"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {app.Department?.dept_name} - {app.prn}
                        </p>
                      </div>

                      <Badge
                        className={getStatusColor("Pending Review") + " border"}
                      >
                        Pending Review
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                      Documents: Available
                    </p>

                    <div className="flex gap-2 mt-3">
                      <Link to="/dashboard/coordinator/verifications">
                        <Button className="bg-green-600 hover:bg-green-700">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link to="/dashboard/coordinator/verifications">
              <Button variant="outline" className="w-full mt-4">
                View All
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-0 bg-card">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground">Avg. Salary</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                -- LPA
              </p>
            </div>

            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-xs text-muted-foreground">Highest Salary</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                -- LPA
              </p>
            </div>

            <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
              <p className="text-xs text-muted-foreground">Companies</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                --
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle>Recent Student Records</CardTitle>
          <CardDescription>
            Latest student placement updates
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Department</th>
                  <th className="py-3 px-4 text-left">CGPA</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Company</th>
                </tr>
              </thead>

              <tbody>
                {students.slice(0, 5).map((student) => {
                  const statusText = getStatusText(student);
                  return (
                    <tr
                      key={student.student_id}
                      className="border-b border-border hover:bg-secondary/50"
                    >
                      <td className="py-3 px-4">{student.full_name || "N/A"}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {student.Department?.dept_name || "N/A"}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {student.cgpa || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={getStatusColor(statusText) + " border"}
                        >
                          {statusText}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        -
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Link to="/dashboard/coordinator/students">
            <Button variant="outline" className="w-full mt-4">
              View All Students
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}




