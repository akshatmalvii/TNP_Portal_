import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellRing, CalendarDays, MapPin, Upload, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { API_BASE_URL } from '../../constants/api';

const API_BASE = `${API_BASE_URL}/api/v1/coordinator`;

const initialRoundForm = {
  round_name: "",
  round_type: "Aptitude Test",
  scheduled_at: "",
  venue: "",
  instructions: "",
  is_final_round: false,
};

export default function DriveUpdatesPage() {
  const { confirm, confirmDialog } = useConfirmDialog();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriveId, setSelectedDriveId] = useState(null);
  const [processLoading, setProcessLoading] = useState(false);
  const [processData, setProcessData] = useState(null);
  const navigate = useNavigate();
  const [roundForm, setRoundForm] = useState(initialRoundForm);
  const [creatingRound, setCreatingRound] = useState(false);
  const [uploadingRoundId, setUploadingRoundId] = useState(null);
  const [uploadFiles, setUploadFiles] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [coordinatorContext, setCoordinatorContext] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/drives`, { headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch drives");
      }

      const nextDrives = Array.isArray(data) ? data : [];
      setDrives(nextDrives);

      if (nextDrives.length > 0) {
        setSelectedDriveId((current) =>
          current && nextDrives.some((drive) => drive.drive_id === current)
            ? current
            : nextDrives[0].drive_id
        );
      } else {
        setSelectedDriveId(null);
        setProcessData(null);
      }
    } catch (err) {
      setError(err.message);
      setDrives([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordinatorContext = async () => {
    try {
      const res = await fetch(`${API_BASE}/context`, { headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch coordinator context");
      }

      setCoordinatorContext(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchProcess = async (driveId) => {
    if (!driveId) return;

    setProcessLoading(true);
    try {
      const res = await fetch(`${API_BASE}/drives/${driveId}/process`, { headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch drive process");
      }

      setProcessData(data);
      setError("");
    } catch (err) {
      setProcessData(null);
      setError(err.message);
    } finally {
      setProcessLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinatorContext();
    fetchDrives();
  }, []);

  useEffect(() => {
    if (selectedDriveId) {
      fetchProcess(selectedDriveId);
    }
  }, [selectedDriveId]);

  const handleCreateRound = async (event) => {
    event.preventDefault();
    if (!selectedDriveId) return;

    setCreatingRound(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/drives/${selectedDriveId}/rounds`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roundForm),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create round");
      }

      setRoundForm(initialRoundForm);
      setSuccess(
        `${data.round.round_name} created successfully. ${data.notifiedCount} students were notified.`
      );
      await Promise.all([fetchDrives(), fetchProcess(selectedDriveId)]);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingRound(false);
    }
  };

  const handleUploadResults = async (round) => {
    const file = uploadFiles[round.round_id];

    if (!file || !selectedDriveId) {
      setError("Please choose an Excel file before uploading results.");
      return;
    }

    const shouldContinue = await confirm({
      title: "Process result sheet?",
      description:
        "Students included in the uploaded sheet will move forward. Every other active applicant for this drive will be marked REJECTED.",
      confirmText: "Upload Results",
    });

    if (!shouldContinue) return;

    setUploadingRoundId(round.round_id);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("resultsFile", file);

      const res = await fetch(
        `${API_BASE}/drives/${selectedDriveId}/rounds/${round.round_id}/results`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload results");
      }

      const unmatchedText =
        Array.isArray(data.unmatchedTnpIds) && data.unmatchedTnpIds.length > 0
          ? ` Unmatched TNP IDs: ${data.unmatchedTnpIds.join(", ")}.`
          : "";

      setSuccess(
        `Results processed. ${data.qualifiedCount} students moved to ${data.qualifiedStatus}, ${data.rejectedCount} students were marked REJECTED.${unmatchedText}`
      );
      setUploadFiles((current) => {
        const next = { ...current };
        delete next[round.round_id];
        return next;
      });

      await Promise.all([fetchDrives(), fetchProcess(selectedDriveId)]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingRoundId(null);
    }
  };

  const filteredDrives = drives.filter((drive) =>
    (drive.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (drive.role_title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const minRoundDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const canManageRounds =
    processData?.drive?.approval_status === "Approved" &&
    processData?.drive?.drive_status === "Active";


  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Drive Results</h1>
          <p className="text-gray-500 mt-1">
            Manage approved drives and rounds for your department.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md text-sm bg-red-100 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-md text-sm bg-green-100 text-green-700">
          {success}
        </div>
      )}

      <Card className="border-0">
        <CardHeader>
          <CardTitle>Department Drives</CardTitle>
          <CardDescription>
            Choose a drive to manage round announcements and result uploads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search drives by company or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading drives...</p>
          ) : drives.length === 0 ? (
            <p className="text-sm text-gray-500">
              No drives are available for your department yet.
            </p>
          ) : filteredDrives.length === 0 ? (
            <p className="text-sm text-gray-500">
              No drives match your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredDrives.map((drive) => (
                <button
                  key={drive.drive_id}
                  type="button"
                  onClick={() => setSelectedDriveId(drive.drive_id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selectedDriveId === drive.drive_id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {drive.company_name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {drive.role_title}
                      </p>
                    </div>
                    <span className="text-xs rounded-full bg-white border px-2 py-1 text-gray-600">
                      {drive.drive_status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-lg bg-white border px-3 py-2">
                      <p className="text-gray-500">Applicants</p>
                      <p className="font-semibold">{drive.totalApplicants}</p>
                    </div>
                    <div className="rounded-lg bg-white border px-3 py-2">
                      <p className="text-gray-500">Active</p>
                      <p className="font-semibold">{drive.activeApplicants}</p>
                    </div>
                    <div className="rounded-lg bg-white border px-3 py-2">
                      <p className="text-gray-500">Rounds</p>
                      <p className="font-semibold">{drive.roundsCount}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDriveId && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-6">
            <Card className="border-0">
              <CardHeader>
                <CardTitle>Create Round</CardTitle>
                <CardDescription>
                  Saving a round automatically notifies all active applicants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateRound}>
                  <div>
                    <label className="text-sm font-medium">Round Name</label>
                    <Input
                      value={roundForm.round_name}
                      onChange={(event) =>
                        setRoundForm((current) => ({
                          ...current,
                          round_name: event.target.value,
                        }))
                      }
                      placeholder="Round 1 - Aptitude Test"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Round Type</label>
                    <select
                      value={roundForm.round_type}
                      onChange={(event) =>
                        setRoundForm((current) => ({
                          ...current,
                          round_type: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      <option>Aptitude Test</option>
                      <option>Group Discussion</option>
                      <option>Technical Interview</option>
                      <option>HR Interview</option>
                      <option>Coding Test</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Schedule</label>
                    <Input
                      type="datetime-local"
                      min={minRoundDateTime}
                      value={roundForm.scheduled_at}
                      onChange={(event) =>
                        setRoundForm((current) => ({
                          ...current,
                          scheduled_at: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Venue</label>
                    <Input
                      value={roundForm.venue}
                      onChange={(event) =>
                        setRoundForm((current) => ({
                          ...current,
                          venue: event.target.value,
                        }))
                      }
                      placeholder="Seminar Hall / Lab / Classroom"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Instructions</label>
                    <textarea
                      rows={4}
                      value={roundForm.instructions}
                      onChange={(event) =>
                        setRoundForm((current) => ({
                          ...current,
                          instructions: event.target.value,
                        }))
                      }
                      placeholder="Bring ID card, report 15 minutes early, carry laptop if needed..."
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-lg border p-3">
                    <input
                      type="checkbox"
                      checked={roundForm.is_final_round}
                      onChange={(event) =>
                        setRoundForm((current) => ({
                          ...current,
                          is_final_round: event.target.checked,
                        }))
                      }
                    />
                    <div>
                      <p className="text-sm font-medium">This is the final round</p>
                      <p className="text-xs text-gray-500">
                        Students in the final uploaded sheet will be marked SELECTED.
                      </p>
                    </div>
                  </label>

                  <Button type="submit" disabled={creatingRound || !canManageRounds} className="w-full">
                    <BellRing className="w-4 h-4 mr-2" />
                    {creatingRound
                      ? "Creating..."
                      : !canManageRounds
                        ? "Approval Required First"
                        : "Create Round & Notify"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-2 space-y-6">
            {processLoading ? (
              <Card className="border-0">
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Loading drive process...</p>
                </CardContent>
              </Card>
            ) : processData ? (
              <>
                <Card className="border-0">
                  <CardHeader>
                    <CardTitle>{processData.drive.company_name}</CardTitle>
                    <CardDescription>
                      {processData.drive.role_title} • {processData.applications.length} applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-gray-500">Drive Status</p>
                      <p className="font-semibold mt-1">{processData.drive.drive_status}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-gray-500">Approval</p>
                      <p className="font-semibold mt-1">{processData.drive.approval_status}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-gray-500">Deadline</p>
                      <p className="font-semibold mt-1">
                        {processData.drive.deadline
                          ? new Date(processData.drive.deadline).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-gray-500">Offer Type</p>
                      <p className="font-semibold mt-1">{processData.drive.offer_type || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>

                {processData.drive.approval_status !== "Approved" && (
                  <Card className="border-0">
                    <CardContent className="pt-6">
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        This drive is still waiting for TPO approval. Students cannot see or apply to it until the TPO approves and publishes it.
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-0">
                  <CardHeader>
                    <CardTitle>Rounds</CardTitle>
                    <CardDescription>
                      Upload an Excel sheet with the TNP IDs of students who cleared the round.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {processData.rounds.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">
                        No rounds created yet for this drive.
                      </div>
                    ) : (
                      processData.rounds.map((round) => (
                        <div key={round.round_id} className="rounded-xl border p-4 space-y-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900">
                                  Round {round.round_number}: {round.round_name}
                                </h3>
                                {round.is_final_round && (
                                  <span className="text-xs rounded-full bg-green-100 text-green-700 px-2 py-1">
                                    Final Round
                                  </span>
                                )}
                                {round.resultsUploaded && (
                                  <span className="text-xs rounded-full bg-blue-100 text-blue-700 px-2 py-1">
                                    Results Uploaded
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 flex flex-col gap-1 text-sm text-gray-500">
                                <p className="flex items-center gap-2">
                                  <CalendarDays className="w-4 h-4" />
                                  {new Date(round.scheduled_at).toLocaleString()}
                                </p>
                                <p className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {round.venue || "Venue not specified"}
                                </p>
                              </div>
                              {round.instructions && (
                                <p className="text-sm text-gray-600 mt-3 leading-6">
                                  {round.instructions}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm min-w-[180px]">
                              <div className="rounded-lg bg-gray-50 border px-3 py-2">
                                <p className="text-gray-500">Qualified</p>
                                <p className="font-semibold">{round.qualifiedCount}</p>
                              </div>
                              <div className="rounded-lg bg-gray-50 border px-3 py-2">
                                <p className="text-gray-500">Rejected</p>
                                <p className="font-semibold">{round.rejectedCount}</p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            Upload only the TNP IDs of students who cleared this round. Every other active applicant for this drive will be marked rejected automatically.
                          </div>

                          <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="flex-1">
                              <label className="text-sm font-medium block mb-1">
                                Result Sheet (.xlsx / .xls)
                              </label>
                              <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(event) =>
                                  setUploadFiles((current) => ({
                                    ...current,
                                    [round.round_id]: event.target.files?.[0] || null,
                                  }))
                                }
                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                                disabled={round.resultsUploaded || !canManageRounds}
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={() => handleUploadResults(round)}
                              disabled={
                                !canManageRounds ||
                                round.resultsUploaded ||
                                uploadingRoundId === round.round_id
                              }
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {uploadingRoundId === round.round_id
                                ? "Uploading..."
                                : round.is_final_round
                                  ? "Upload Final Results"
                                  : "Upload Round Results"}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0">
                  <CardHeader>
                    <CardTitle>Applicants</CardTitle>
                    <CardDescription>
                      Current drive application status for your department students.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {processData.applications.length === 0 ? (
                      <p className="text-sm text-gray-500">No applications yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-3 text-left">Student</th>
                              <th className="py-3 text-left">TNP ID</th>
                              <th className="py-3 text-left">Email</th>
                              <th className="py-3 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {processData.applications.map((application) => (
                              <tr key={application.application_id} className="border-b last:border-b-0">
                                <td className="py-3">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span>{application.Student?.full_name || "Unnamed Student"}</span>
                                  </div>
                                </td>
                                <td className="py-3 font-mono text-xs">
                                  {application.Student?.tnp_id || "—"}
                                </td>
                                <td className="py-3 text-gray-500">
                                  {application.Student?.email || "—"}
                                </td>
                                <td className="py-3">
                                  <span className="text-xs rounded-full border px-2 py-1 bg-gray-50 text-gray-700">
                                    {application.application_status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </div>
      )}

      {confirmDialog}
    </div>
  );
}






