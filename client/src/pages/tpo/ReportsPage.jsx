import React, { useEffect, useState } from "react";
import { BarChart, Users, Building, TrendingDown, TrendingUp, Download, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { API_BASE_URL } from '../constants/api';

const API_BASE = "`${API_BASE_URL}`/api/v1/tpo";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="text-center py-20">
    <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-block">
      <p className="font-semibold">Error Loading Report</p>
      <p className="text-sm">{message}</p>
      <button 
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  </div>
);

export default function ReportsPage() {
  const [seasons, setSeasons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReportFilters();
  }, []);

  useEffect(() => {
    if (selectedSeason) {
      fetchReportData(selectedSeason, selectedCourse);
    }
  }, [selectedSeason, selectedCourse]);

  const fetchSeasons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/reports/seasons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load placement seasons");
      const data = await res.json();
      setSeasons(data);
      setError("");
      if (data.length > 0) {
        setSelectedSeason(data[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load courses");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const loadReportFilters = () => {
    fetchSeasons();
    fetchCourses();
  };

  const fetchReportData = async (season, courseId = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const query = new URLSearchParams();
      if (courseId) {
        query.set("course_id", courseId);
      }

      const res = await fetch(`${API_BASE}/reports/${season}?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load report data");
      const data = await res.json();
      setReportData(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!selectedSeason) return;

    setExporting(true);
    try {
      const token = localStorage.getItem("token");
      const query = new URLSearchParams();
      if (selectedCourse) {
        query.set("course_id", selectedCourse);
      }

      const res = await fetch(`${API_BASE}/reports/${selectedSeason}/download?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error("Failed to export placement report");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const departmentSlug = String(reportData?.department?.dept_code || "department").replace(/[^a-zA-Z0-9_-]+/g, "-");
      const courseSlug = String(reportData?.course?.course_name || "all-courses").replace(/[^a-zA-Z0-9_-]+/g, "-");
      const seasonSlug = selectedSeason.replace(/[^a-zA-Z0-9_-]+/g, "-");
      anchor.download = `placement-report-${departmentSlug}-${courseSlug}-${seasonSlug}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  const selectedCourseName = reportData?.course?.course_name || courses.find((course) => String(course.course_id) === selectedCourse)?.course_name || "All Courses";

  if (error) return <ErrorState message={error} onRetry={loadReportFilters} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Placement Reports</h1>
          <p className="text-gray-500 mt-1">Detailed breakdown of departmental placement outcomes by course</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm bg-white px-4 py-2 text-sm focus:ring-indigo-500 font-medium min-w-[180px]"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_name}
              </option>
            ))}
          </select>
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm bg-white px-4 py-2 text-sm focus:ring-indigo-500 font-medium min-w-[180px]"
          >
            {seasons.length === 0 && <option value="">No Seasons Found</option>}
            {seasons.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleExport}
            disabled={!selectedSeason || exporting || loading}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export Excel"}
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !reportData ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-lg shadow-sm">Select a season to view records</div>
      ) : (
        <>
          {/* Top Level Aggregate Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <Card className="border-0 shadow-sm border-l-4 border-indigo-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Placements</p>
                    <h3 className="text-2xl font-bold">{reportData.totalPlaced}</h3>
                    <p className="text-xs text-gray-400 mt-1">Out of {reportData.totalStudents} Registered</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-emerald-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Highest CTC</p>
                    <h3 className="text-2xl font-bold">₹{reportData.packageMetrics.highest} L</h3>
                    <p className="text-xs text-gray-400 mt-1">Lakhs Per Annum</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-blue-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Average CTC</p>
                    <h3 className="text-2xl font-bold">₹{reportData.packageMetrics.average} L</h3>
                    <p className="text-xs text-gray-400 mt-1">Mathematics Mean</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <BarChart className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-rose-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Lowest CTC</p>
                    <h3 className="text-2xl font-bold">₹{reportData.packageMetrics.lowest} L</h3>
                    <p className="text-xs text-gray-400 mt-1">Lakhs Per Annum</p>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-amber-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Companies</p>
                    <h3 className="text-2xl font-bold">{reportData.companiesVisited.length}</h3>
                    <p className="text-xs text-gray-400 mt-1">Visited in {selectedSeason} for {selectedCourseName}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                    <Building className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Offer Categories */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">Offer Categories</CardTitle>
              </CardHeader>
              <CardContent className="pt-5 flex place-content-around">
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-indigo-700">{reportData.offerBreakdown.placement}</h4>
                  <p className="text-sm text-gray-500 font-medium">Direct Placement</p>
                </div>
                <div className="text-center border-l px-8">
                  <h4 className="text-2xl font-bold text-emerald-600">{reportData.offerBreakdown.internship_ppo}</h4>
                  <p className="text-sm text-gray-500 font-medium">Internship + PPO</p>
                </div>
                <div className="text-center border-l px-8">
                  <h4 className="text-2xl font-bold text-amber-600">{reportData.offerBreakdown.internship}</h4>
                  <p className="text-sm text-gray-500 font-medium">Only Internship</p>
                </div>
              </CardContent>
            </Card>

            {/* Gender Breakdown */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">Gender Diversity Demographics</CardTitle>
              </CardHeader>
              <CardContent className="pt-5 flex place-content-around items-center">
                <div className="flex items-center gap-3">
                  <div className="p-4 bg-blue-50 rounded-full text-blue-500">
                     <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800">{reportData.genderBreakdown.male}</h4>
                    <p className="text-sm text-gray-500 font-medium">Male Students Placed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-4 bg-pink-50 rounded-full text-pink-500">
                     <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800">{reportData.genderBreakdown.female}</h4>
                    <p className="text-sm text-gray-500 font-medium">Female Students Placed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Matrix Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle>Detailed Student Placements</CardTitle>
              <p className="text-sm text-gray-500">Full audit log of student metrics, packages, and bonds associated with {selectedCourseName} offers for {selectedSeason}.</p>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Identifier (TNP/PRN)</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Placement Status</th>
                    <th className="px-4 py-3">Offer Category</th>
                    <th className="px-4 py-3">Monetary Package</th>
                    <th className="px-4 py-3">Contract Restrictions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportData.placedStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No placements recorded for this season.</td>
                    </tr>
                  ) : (
                    reportData.placedStudents.map((ps, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-gray-800">{ps.full_name}</p>
                          <p className="text-xs text-gray-500">{ps.gender}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-mono text-xs">{ps.tnp_id}</p>
                          <p className="font-mono text-xs text-gray-500">{ps.prn}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-indigo-700">{ps.company_name}</p>
                          <p className="text-xs text-gray-500">{ps.role_title}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              ps.is_final_placement
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {ps.placement_status}
                          </span>
                          {ps.is_final_placement && ps.previous_companies?.length > 0 ? (
                            <p className="text-xs text-gray-500 mt-2">
                              Earlier: {ps.previous_companies.join(", ")}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium 
                            ${ps.offer_category === 'Placement' ? 'bg-emerald-100 text-emerald-700' : 
                              ps.offer_category === 'Internship' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}
                          `}>
                            {ps.offer_category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {ps.package_lpa ? <p className="font-semibold">₹{ps.package_lpa} LPA</p> : null}
                          {ps.stipend_pm ? <p className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-1">Stipend: {ps.stipend_pm}</p> : null}
                        </td>
                        <td className="px-4 py-4 space-y-1">
                          {ps.has_bond ? (
                             <span className="block text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                               Bond: {ps.bond_months} Months
                             </span>
                          ) : null}
                          {ps.has_security_deposit ? (
                             <span className="block text-xs text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-100">
                               Cheque: {ps.security_deposit_amount}
                             </span>
                          ) : null}
                          {!ps.has_bond && !ps.has_security_deposit ? (
                            <span className="text-xs text-gray-400">Standard / None</span>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}


