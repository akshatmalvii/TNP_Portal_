import React, { useEffect, useState } from "react";
import { Calendar, DollarSign, Search } from "lucide-react";

export default function StudentDrivePage() {
  const [drives, setDrives] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appliedDrives, setAppliedDrives] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      try {
        const [drivesRes, appsRes] = await Promise.all([
          fetch("http://localhost:5000/api/v1/drives", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:5000/api/v1/drives/applications", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (drivesRes.ok && appsRes.ok) {
          const driveData = await drivesRes.json();
          const appData = await appsRes.json();

          setDrives(driveData);
          setAppliedDrives(appData.map((a) => a.drive_id));
        }
      } catch (error) {
        console.error("Error loading drives", error);
      }
    };

    fetchData();
  }, []);

  const filteredDrives = drives.filter((drive) => {
    const companyName = drive.company_name || "";
    const position = drive.position || "";

    const matchesSearch =
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.toLowerCase().includes(searchTerm.toLowerCase());

    const status = drive.drive_status || "";
    const matchesStatus =
      statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApply = async (driveId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/drives/${driveId}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ application_data: {} })
        }
      );

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Failed to apply");
      }

      setAppliedDrives((prev) => [...prev, driveId]);
    } catch (error) {
      console.error("Apply error", error);
      alert(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-700";
      case "Closed":
        return "bg-red-100 text-red-700";
      case "Selected":
        return "bg-blue-100 text-blue-700";
      case "Shortlisted":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Job Drives</h1>
        <p className="text-gray-500 mt-1">
          Browse and apply to available job drives.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="bg-white shadow rounded-lg p-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company or position..."
            className="w-full border rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "Open", "Shortlisted", "Selected"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded border text-sm ${
                statusFilter === filter
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {filter === "all" ? "All Drives" : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Drives List */}
      <div className="space-y-4">
        {filteredDrives.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-400">
            No drives found matching your criteria
          </div>
        ) : (
          filteredDrives.map((drive) => {
            const hasApplied = appliedDrives.includes(drive.id);
            const deadline = new Date(drive.deadline);
            const isExpired = deadline < new Date();

            return (
              <div
                key={drive.id}
                className="bg-white shadow rounded-lg p-5 hover:shadow-md transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Company */}
                  <div>
                    <h3 className="font-bold text-lg">
                      {drive.company_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {drive.position}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold">
                        {drive.salary || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {isExpired
                          ? "Expired"
                          : `Deadline: ${deadline.toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${getStatusColor(
                        drive.drive_status
                      )}`}
                    >
                      {drive.drive_status}
                    </span>

                    {hasApplied && (
                      <span className="px-2 py-1 text-xs rounded bg-gray-200">
                        Applied
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    {hasApplied ? (
                      <button
                        disabled
                        className="px-4 py-2 border rounded bg-gray-100 text-gray-500"
                      >
                        Applied
                      </button>
                    ) : isExpired ? (
                      <button
                        disabled
                        className="px-4 py-2 border rounded bg-gray-100 text-gray-500"
                      >
                        Expired
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApply(drive.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}