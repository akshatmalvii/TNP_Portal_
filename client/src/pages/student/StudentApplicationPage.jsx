import React, { useState, useEffect } from "react";
import { CheckCircle2, Clock, FileText } from "lucide-react";

export default function StudentApplicationPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/drives/applications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
        }
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchApplications();
    }
  }, [token]);

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "SELECTED":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "SHORTLISTED":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "SELECTED":
        return "bg-green-100 text-green-700";
      case "SHORTLISTED":
        return "bg-yellow-100 text-yellow-700";
      case "APPLIED":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const groupedApplications = {
    selected: applications.filter((a) => a.application_status === "SELECTED"),
    shortlisted: applications.filter((a) => a.application_status === "SHORTLISTED"),
    applied: applications.filter((a) => a.application_status === "APPLIED"),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <p className="text-gray-500">Loading applications...</p>
      </div>
    );
  }

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
            {applications.length}
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
                  key={app.application_id}
                  className="bg-white shadow rounded-lg p-5 hover:shadow-md"
                >
                  <div className="flex justify-between">

                    <div className="flex gap-4">

                      <div className="p-2 bg-green-100 rounded-lg">
                        {getStatusIcon(app.application_status)}
                      </div>

                      <div>
                        <h3 className="font-bold text-lg">{app.Drive?.company_name || 'Unknown Company'}</h3>

                        <p className="text-sm text-gray-500">
                          Applied on{" "}
                          {new Date(app.applied_at || app.updated_at).toLocaleDateString()}
                        </p>

                        <p className="text-sm text-green-600 font-medium mt-2">
                          {/* We don't have result dynamically right now, placeholder */}
                          {app.application_status === 'SELECTED' ? 'Offer Extended' : ''}
                        </p>
                      </div>

                    </div>

                    <span
                      className={`px-2 py-1 text-xs rounded ${getStatusColor(
                        app.application_status
                      )}`}
                    >
                      {app.application_status}
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
                  key={app.application_id}
                  className="bg-white shadow rounded-lg p-5 hover:shadow-md"
                >
                  <div className="flex justify-between">

                    <div className="flex gap-4">

                      <div className="p-2 bg-yellow-100 rounded-lg">
                        {getStatusIcon(app.application_status)}
                      </div>

                      <div>
                        <h3 className="font-bold text-lg">{app.Drive?.company_name || 'Unknown Company'}</h3>

                        <p className="text-sm text-gray-500">
                          Applied on{" "}
                          {new Date(app.applied_at || app.updated_at).toLocaleDateString()}
                        </p>

                        <p className="text-sm text-yellow-600 font-medium mt-2">
                          {/* Placeholder */}
                          {app.application_status === 'SHORTLISTED' ? 'Under Review' : ''}
                        </p>
                      </div>

                    </div>

                    <span
                      className={`px-2 py-1 text-xs rounded ${getStatusColor(
                        app.application_status
                      )}`}
                    >
                      {app.application_status}
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
                  key={app.application_id}
                  className="bg-white shadow rounded-lg p-5 hover:shadow-md"
                >
                  <div className="flex justify-between">

                    <div className="flex gap-4">

                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getStatusIcon(app.application_status)}
                      </div>

                      <div>
                        <h3 className="font-bold text-lg">{app.Drive?.company_name || 'Unknown Company'}</h3>

                        <p className="text-sm text-gray-500">
                          Applied on{" "}
                          {new Date(app.applied_at || app.updated_at).toLocaleDateString()}
                        </p>

                        <p className="text-sm text-blue-600 font-medium mt-2">
                           Application received
                        </p>
                      </div>

                    </div>

                    <span
                      className={`px-2 py-1 text-xs rounded ${getStatusColor(
                        app.application_status
                      )}`}
                    >
                      {app.application_status}
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