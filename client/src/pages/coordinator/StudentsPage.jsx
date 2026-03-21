import React, { useState } from "react";
import { mockStudents } from "./mockData";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Placed":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "Shortlisted":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "Applied":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

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
              {["all", "Placed", "Shortlisted", "Applied", "Not Applied"].map(
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
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-border hover:bg-secondary/50"
                    >
                      <td className="py-3 px-4 font-medium">
                        {student.name}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {student.email}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {student.department}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {student.cgpa}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            getStatusColor(student.status) + " border"
                          }
                        >
                          {student.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {student.placedCompany}
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}