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
import { Search, Users as UsersIcon, Mail, BookOpen, GraduationCap } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredStudents = students.filter((student) => {
    return (
      (student.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.tnp_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.prn || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return <div className="p-6 text-gray-500 flex items-center gap-2">
      <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full font-bold"></div>
      Loading verified roster...
    </div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Verified Students</h1>
          <p className="text-muted-foreground mt-1">
            Directory of all students in your department who have completed verification.
          </p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
           <UsersIcon className="w-4 h-4" />
           {students.length} Total Verified
        </div>
      </div>

      {/* Search */}
      <Card className="border-0 bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, TNP ID or PRN..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 bg-card shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-gray-50/50">
               <UsersIcon className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-lg font-medium text-gray-400">No students found matching your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-border text-gray-600 uppercase text-[11px] font-bold tracking-wider">
                    <th className="py-4 px-6 text-left">Student Info</th>
                    <th className="py-4 px-6 text-left">Identifiers</th>
                    <th className="py-4 px-6 text-left">Academic Profile</th>
                    <th className="py-4 px-6 text-left">Verification Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((student) => {
                    return (
                      <tr
                        key={student.student_id}
                        className="hover:bg-indigo-50/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{student.full_name || "N/A"}</span>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                              <Mail className="w-3 h-3 text-indigo-400" />
                              {student.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                           <div className="flex flex-col gap-1">
                              <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded w-fit text-gray-700">TNP: {student.tnp_id || "PENDING"}</span>
                              <span className="text-xs font-mono bg-indigo-50 px-1.5 py-0.5 rounded w-fit text-indigo-700">PRN: {student.prn || "N/A"}</span>
                           </div>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground">
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-xs">
                                 <BookOpen className="w-3 h-3" />
                                 {student.Course?.course_name || "N/A"}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600">
                                 <GraduationCap className="w-3 h-3" />
                                 CGPA: {student.cgpa || "-"}
                              </div>
                           </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            className="bg-green-100 text-green-700 border-green-200 px-2.5 py-1"
                          >
                            Verified
                          </Badge>
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