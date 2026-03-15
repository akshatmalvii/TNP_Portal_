import React, { useState } from "react";
import { mockDrives } from "./mockDrives.js";
import { Calendar, DollarSign, Search } from "lucide-react";

export default function StudentDrivePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [appliedDrives, setAppliedDrives] = useState(
    mockDrives.filter((d) => d.applied).map((d) => d.id)
  );

  const filteredDrives = mockDrives.filter((drive) => {
    const matchesSearch =
      drive.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || drive.status === statusFilter;

    return matchesSearch && matchesStatus && drive.eligible;
  });

  const handleApply = (driveId) => {
    if (!appliedDrives.includes(driveId)) {
      setAppliedDrives([...appliedDrives, driveId]);
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

        {/* Search */}
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

        {/* Filters */}
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
                    <h3 className="font-bold text-lg">{drive.company}</h3>
                    <p className="text-sm text-gray-500">{drive.position}</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold">
                        {drive.salary}
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
                        drive.status
                      )}`}
                    >
                      {drive.status}
                    </span>

                    {drive.applied && (
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