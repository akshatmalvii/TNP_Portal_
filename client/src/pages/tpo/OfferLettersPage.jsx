import React, { useState, useEffect } from "react";
import { Download, ExternalLink, Search, FileText, User, Building, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { API_BASE_URL } from '../../constants/api';

export default function OfferLettersPage() {
  const [letters, setLetters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const fetchFilters = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [coursesRes, seasonsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/tpo/courses`, { headers }),
        fetch(`${API_BASE_URL}/api/v1/tpo/reports/seasons`, { headers }),
      ]);

      if (coursesRes.ok) {
        const courseData = await coursesRes.json();
        setCourses(Array.isArray(courseData) ? courseData : []);
      }

      if (seasonsRes.ok) {
        const seasonData = await seasonsRes.json();
        const nextSeasons = Array.isArray(seasonData) ? seasonData : [];
        setSeasons(nextSeasons);
        setSelectedSeason((current) => current || nextSeasons[0] || "");
      }
    } catch (err) {
      console.error("Failed to fetch offer-letter filters", err);
    }
  };

  const fetchLetters = async () => {
    try {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams();
      if (selectedSeason) query.set("season", selectedSeason);
      if (selectedCourse) query.set("course_id", selectedCourse);

      const res = await fetch(`${API_BASE_URL}/api/v1/tpo/offer-letters?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch offer letters");
      }
      const data = await res.json();
      setLetters(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchLetters();
  }, [selectedSeason, selectedCourse]);

  const filteredLetters = letters.filter((l) =>
    (l.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.tnp_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.prn || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.course_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submitted Offer Letters</h1>
        <p className="text-gray-500 mt-1">Review and manage office letters submitted by placed students.</p>
      </div>

      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by student, TNP ID, PRN, company, or course..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
              >
                <option value="">All Seasons</option>
                {seasons.map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="py-6">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredLetters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">No Offer Letters Found</h2>
            <p className="text-gray-500 mt-2 text-center max-w-md">
              {searchTerm || selectedCourse || selectedSeason
                ? "No results match the selected search or filters."
                : "No students have submitted their offer letters yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden text-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="px-6 py-4 text-left">Student Info</th>
                  <th className="px-6 py-4 text-left">Course</th>
                  <th className="px-6 py-4 text-left">Placement Details</th>
                  <th className="px-6 py-4 text-left">Season</th>
                  <th className="px-6 py-4 text-left">Submission Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLetters.map((letter) => (
                  <tr key={letter.offer_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{letter.full_name}</span>
                        <span className="text-gray-500 text-xs">TNP ID: {letter.tnp_id}</span>
                        <span className="text-gray-500 text-xs">PRN: {letter.prn}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {letter.course_name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-indigo-700">{letter.company_name}</span>
                        <span className="text-gray-500 text-xs">{letter.position}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {letter.placement_season || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(letter.offer_letter_timestamp).toLocaleDateString()}
                      <br />
                      <span className="text-[10px] text-gray-400">{new Date(letter.offer_letter_timestamp).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                         <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-2 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                          onClick={() => {
                            const win = window.open();
                            win.document.write(`<iframe src="${letter.offer_letter_url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                          }}
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View Letter
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}






