import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import { API_BASE_URL } from '../constants/api';

const getCompanyName = (application) =>
  application.Drive?.company_name ||
  application.Drive?.Company?.company_name ||
  "Unknown Company";

const getLatestRoundResult = (application) => {
  const results = Array.isArray(application.DriveRoundResults)
    ? application.DriveRoundResults
    : [];

  if (results.length === 0) return null;

  return [...results].sort((a, b) => {
    const aOrder = a.DriveRound?.round_number || 0;
    const bOrder = b.DriveRound?.round_number || 0;
    return bOrder - aOrder;
  })[0];
};

export default function StudentApplicationPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/drives/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setApplications(Array.isArray(data) ? data : []);
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
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "SELECTED":
        return "bg-green-100 text-green-700";
      case "SHORTLISTED":
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "APPLIED":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getSummaryText = (application) => {
    const latestRound = getLatestRoundResult(application);
    const status = application.application_status?.toUpperCase();

    if (status === "SELECTED") {
      return application.Offer
        ? "Final selection confirmed"
        : "Selected for this drive";
    }

    if (status === "REJECTED" && latestRound?.DriveRound) {
      return `Rejected in ${latestRound.DriveRound.round_name}`;
    }

    if ((status === "SHORTLISTED" || status === "IN_PROGRESS") && latestRound?.DriveRound) {
      return `Cleared ${latestRound.DriveRound.round_name}`;
    }

    if (status === "SHORTLISTED") {
      return "Shortlisted for the process";
    }

    if (status === "IN_PROGRESS") {
      return "Still active in the selection process";
    }

    return "Application submitted and under review";
  };

  const groupedApplications = {
    selected: applications.filter((app) => app.application_status === "SELECTED"),
    activeProcess: applications.filter((app) =>
      ["SHORTLISTED", "IN_PROGRESS"].includes(app.application_status)
    ),
    applied: applications.filter((app) => app.application_status === "APPLIED"),
    rejected: applications.filter((app) => app.application_status === "REJECTED"),
  };

  const sections = [
    {
      key: "selected",
      title: "Selected",
      items: groupedApplications.selected,
    },
    {
      key: "activeProcess",
      title: "In Process",
      items: groupedApplications.activeProcess,
    },
    {
      key: "applied",
      title: "Under Review",
      items: groupedApplications.applied,
    },
    {
      key: "rejected",
      title: "Rejected",
      items: groupedApplications.rejected,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <p className="text-gray-500">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-gray-500 mt-1">
          Track the latest status of every drive you have applied to.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-sm text-gray-500">Total Applications</p>
          <p className="text-3xl font-bold mt-2">{applications.length}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-sm text-gray-500">Selected</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {groupedApplications.selected.length}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-sm text-gray-500">In Process</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {groupedApplications.activeProcess.length}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {groupedApplications.rejected.length}
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-400">
          No applications found yet.
        </div>
      ) : (
        sections.map((section) =>
          section.items.length > 0 ? (
            <div key={section.key} className="space-y-4">
              <h2 className="text-xl font-bold">{section.title}</h2>

              {section.items.map((application) => {
                const latestRound = getLatestRoundResult(application);

                return (
                  <div
                    key={application.application_id}
                    className="bg-white shadow rounded-lg p-5 hover:shadow-md"
                  >
                    <div className="flex justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getStatusIcon(application.application_status)}
                        </div>

                        <div>
                          <h3 className="font-bold text-lg">
                            {getCompanyName(application)}
                          </h3>

                          <p className="text-sm text-gray-500">
                            Applied on{" "}
                            {new Date(
                              application.applied_at || application.updated_at
                            ).toLocaleDateString()}
                          </p>

                          <p className="text-sm font-medium mt-2 text-gray-700">
                            {getSummaryText(application)}
                          </p>

                          {latestRound?.DriveRound && (
                            <p className="text-xs text-gray-500 mt-2">
                              Latest round: Round {latestRound.DriveRound.round_number} -{" "}
                              {latestRound.DriveRound.round_name}
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`h-fit px-2 py-1 text-xs rounded ${getStatusColor(
                          application.application_status
                        )}`}
                      >
                        {application.application_status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null
        )
      )}
    </div>
  );
}





