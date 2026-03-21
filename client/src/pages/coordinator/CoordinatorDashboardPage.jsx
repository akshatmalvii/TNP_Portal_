import React from "react";
import { mockStudents, mockPendingApplications, mockAnalytics } from "./mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Users, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function CoordinatorDashboard() {
  const stats = [
    {
      title: "Total Students",
      value: mockAnalytics.totalStudents,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Placed Students",
      value: mockAnalytics.totalPlaced,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "Pending Verifications",
      value: mockPendingApplications.length,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Placement %",
      value: `${mockAnalytics.placementPercentage}%`,
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ];

  const recentVerifications = mockPendingApplications.slice(0, 3);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending Verification":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "Pending Review":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

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
                    key={app.id}
                    className="p-4 border border-border rounded-lg hover:bg-secondary/20 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {app.studentName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {app.company} - {app.position}
                        </p>
                      </div>

                      <Badge
                        className={getStatusColor(app.status) + " border"}
                      >
                        {app.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                      Documents: {app.documents}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Approve
                      </Button>
                      <Button variant="outline">Request Info</Button>
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
                {mockAnalytics.averageSalary} LPA
              </p>
            </div>

            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-xs text-muted-foreground">Highest Salary</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {mockAnalytics.highestSalary} LPA
              </p>
            </div>

            <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
              <p className="text-xs text-muted-foreground">Companies</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {mockAnalytics.companyCount}
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
                {mockStudents.slice(0, 5).map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-border hover:bg-secondary/50"
                  >
                    <td className="py-3 px-4">{student.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {student.department}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {student.cgpa}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          student.status === "Placed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {student.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {student.placedCompany}
                    </td>
                  </tr>
                ))}
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