import React from "react";
import { mockApplications } from "./mockDrives.js";
import { CheckCircle2, Clock, FileText } from "lucide-react";

export default function StudentApplicationPage() {

  const getStatusIcon = (status) => {
    switch (status) {
      case "Selected":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "Shortlisted":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Selected":
        return "bg-green-100 text-green-700";
      case "Shortlisted":
        return "bg-yellow-100 text-yellow-700";
      case "Applied":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const groupedApplications = {
    selected: mockApplications.filter((a) => a.status === "Selected"),
    shortlisted: mockApplications.filter((a) => a.status === "Shortlisted"),
    applied: mockApplications.filter((a) => a.status === "Applied"),
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-gray-500 mt-1">
          Track the status of all your job applications.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-sm text-gray-500">Total Applications</p>
          <p className="text-3xl font-bold mt-2">
            {mockApplications.length}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-sm text-gray-500">Selected</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {groupedApplications.selected.length}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-sm text-gray-500">Shortlisted</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {groupedApplications.shortlisted.length}
          </p>
        </div>

      </div>

      {(groupedApplications.selected.length > 0 ||
        groupedApplications.shortlisted.length > 0 ||
        groupedApplications.applied.length > 0) ? (
        <>

          {/* Selected */}
          {groupedApplications.selected.length > 0 && (
            <div className="space-y-4">

              <h2 className="text-xl font-bold">Selected</h2>

              {groupedApplications.selected.map((app) => (
                <div
                  key={app.id}
                  className="bg-white shadow rounded-lg p-5 hover:shadow-md"
                >
                  <div className="flex justify-between">

                    <div className="flex gap-4">

                      <div className="p-2 bg-green-100 rounded-lg">
                        {getStatusIcon(app.status)}
                      </div>

                      <div>
                        <h3 className="font-bold text-lg">{app.company}</h3>

                        <p className="text-sm text-gray-500">
                          Applied on{" "}
                          {new Date(app.appliedDate).toLocaleDateString()}
                        </p>

                        <p className="text-sm text-green-600 font-medium mt-2">
                          {app.result}
                        </p>
                      </div>

                    </div>

                    <span
                      className={`px-2 py-1 text-xs rounded ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>

                  </div>
                </div>
              ))}

            </div>
          )}

          {/* Shortlisted */}
          {groupedApplications.shortlisted.length > 0 && (
            <div className="space-y-4">

              <h2 className="text-xl font-bold">Shortlisted</h2>

              {groupedApplications.shortlisted.map((app) => (
                <div
                  key={app.id}
                  className="bg-white shadow rounded-lg p-5 hover:shadow-md"
                >
                  <div className="flex justify-between">

                    <div className="flex gap-4">

                      <div className="p-2 bg-yellow-100 rounded-lg">
                        {getStatusIcon(app.status)}
                      </div>

                      <div>
                        <h3 className="font-bold text-lg">{app.company}</h3>

                        <p className="text-sm text-gray-500">
                          Applied on{" "}
                          {new Date(app.appliedDate).toLocaleDateString()}
                        </p>

                        <p className="text-sm text-yellow-600 font-medium mt-2">
                          {app.result}
                        </p>
                      </div>

                    </div>

                    <span
                      className={`px-2 py-1 text-xs rounded ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>

                  </div>
                </div>
              ))}

            </div>
          )}

          {/* Applied */}
          {groupedApplications.applied.length > 0 && (
            <div className="space-y-4">

              <h2 className="text-xl font-bold">Under Review</h2>

              {groupedApplications.applied.map((app) => (
                <div
                  key={app.id}
                  className="bg-white shadow rounded-lg p-5 hover:shadow-md"
                >
                  <div className="flex justify-between">

                    <div className="flex gap-4">

                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getStatusIcon(app.status)}
                      </div>

                      <div>
                        <h3 className="font-bold text-lg">{app.company}</h3>

                        <p className="text-sm text-gray-500">
                          Applied on{" "}
                          {new Date(app.appliedDate).toLocaleDateString()}
                        </p>

                        <p className="text-sm text-blue-600 font-medium mt-2">
                          {app.result}
                        </p>
                      </div>

                    </div>

                    <span
                      className={`px-2 py-1 text-xs rounded ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>

                  </div>
                </div>
              ))}

            </div>
          )}

        </>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-400">
          No applications yet. Start applying to job drives!
        </div>
      )}
    </div>
  );
}