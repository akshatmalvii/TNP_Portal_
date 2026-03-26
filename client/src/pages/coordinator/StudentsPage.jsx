import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Search } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/v1/verification/coordinator/all", {
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

  const getStatusText = (student) => {
    const vr = student.StudentVerificationRequest;
    if (!vr) return "Not Verified";
    if (vr.coordinator_status === "Pending") return "Pending Review";
    if (vr.coordinator_status === "Approved") return "Verified";
    if (vr.coordinator_status === "Rejected") return "Rejected";
    return "Unknown";
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const statusObj = getStatusText(student);
    const matchesStatus =
      statusFilter === "all" || statusObj === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
    return <div className="p-6 text-gray-500">Loading students...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track student records and placements.
        </p>
      </div>

      {/* Search + Filter */}
      <Card className="border-0 bg-card">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["all", "Verified", "Pending Review", "Not Verified", "Rejected"].map(
                (filter) => (
                  <Button
                    key={filter}
                    variant={statusFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(filter)}
                  >
                    {filter === "all" ? "All Students" : filter}
                  </Button>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 bg-card">
        <CardContent className="pt-6">
          {filteredStudents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No students found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Department</th>
                    <th className="py-3 px-4 text-left">CGPA</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Company</th>
                    <th className="py-3 px-4 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => {
                    const statusText = getStatusText(student);
                    return (
                      <tr
                        key={student.student_id}
                        className="border-b border-border hover:bg-secondary/50"
                      >
                        <td className="py-3 px-4 font-medium">
                          {student.full_name || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {student.email}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {student.Department?.dept_name || "N/A"}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {student.cgpa || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              getStatusColor(statusText) + " border"
                            }
                          >
                            {statusText}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {/* Placed Company pending Offer module */}
                          -
                        </td>
                        <td className="py-3 px-4">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}