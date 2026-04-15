import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { CheckCircle2, Clock, IndianRupee, XCircle } from "lucide-react";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { API_BASE_URL } from '../../constants/api';

const API_BASE = `${API_BASE_URL}/api/v1/tpo`;

export default function ApprovalsPage() {
  const { confirm, confirmDialog } = useConfirmDialog();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/drive-approvals`, { headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch pending approvals");
      }

      setRequests(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDecision = async (request, action) => {
    const shouldContinue = await confirm({
      title: `${action === "approve" ? "Approve" : "Reject"} drive request?`,
      description:
        action === "approve"
          ? "Approving will publish this drive to eligible students immediately."
          : "Rejecting will keep this drive hidden from students until the coordinator updates and resubmits it.",
      confirmText: action === "approve" ? "Approve Drive" : "Reject Drive",
      tone: action === "approve" ? "neutral" : "danger",
    });

    if (!shouldContinue) return;

    setActionId(request.drive_id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/drive-approvals/${request.drive_id}/${action}`, {
        method: "POST",
        headers,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action} drive`);
      }

      setSuccess(data.message || `Drive ${action}d successfully`);
      await fetchRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Drive Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review coordinator-created drives and publish them for students after approval.
        </p>
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

      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle>Pending Drive Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading pending requests...</p>
          ) : requests.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No pending drive requests for your department right now.
            </div>
          ) : (
            requests.map((req) => (
              <Card key={req.drive_id} className="border bg-white shadow-none">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{req.company_name}</h3>
                      <p className="text-sm text-muted-foreground">{req.role_title}</p>
                    </div>

                    <Badge className="bg-yellow-500/10 text-yellow-700 border border-yellow-200">
                      Pending Approval
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Package</p>
                      <p className="font-semibold inline-flex items-center gap-1">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {req.package_lpa || "N/A"} LPA
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="font-semibold">
                        {req.deadline ? new Date(req.deadline).toLocaleDateString() : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Offer Type</p>
                      <p className="font-semibold">{req.offer_type || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="font-semibold">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleDecision(req, "approve")}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={actionId === req.drive_id}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {actionId === req.drive_id ? "Processing..." : "Approve & Publish"}
                    </Button>

                    <Button
                      onClick={() => handleDecision(req, "reject")}
                      variant="destructive"
                      className="flex-1"
                      disabled={actionId === req.drive_id}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {confirmDialog}
    </div>
  );
}






