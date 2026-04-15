import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Badge } from "../../components/Badge";
import { ShieldCheck, History, Landmark } from "lucide-react";
import { API_BASE_URL } from '../constants/api';

const API_BASE = `${API_BASE_URL}/api/v1`;

const DEFAULT_FORM = {
  allow_apply_after_internship: true,
  allow_apply_after_placement: false,
  min_package_difference: 0,
  ignore_package_condition: false,
  current_placement_season: "",
  change_note: "",
};

const formatDateTime = (value) => {
  if (!value) return "-`;
  return new Date(value).toLocaleString();
};

const formatGap = (value) => {
  const numeric = Number(value || 0);
  return `${numeric} LPA`;
};

function ChoiceButtons({ label, value, trueLabel, falseLabel, onChange, helper }) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {helper ? <p className="text-xs text-gray-500 mt-1">{helper}</p> : null}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={value ? "default" : "outline"}
          onClick={() => onChange(true)}
        >
          {trueLabel}
        </Button>
        <Button
          type="button"
          variant={!value ? "default" : "outline"}
          onClick={() => onChange(false)}
        >
          {falseLabel}
        </Button>
      </div>
    </div>
  );
}

export default function PlacementPolicyPage() {
  const [policyData, setPolicyData] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const syncFormFromPolicy = (currentPolicy, department) => {
    setForm({
      allow_apply_after_internship:
        currentPolicy?.allow_apply_after_internship ?? DEFAULT_FORM.allow_apply_after_internship,
      allow_apply_after_placement:
        currentPolicy?.allow_apply_after_placement ?? DEFAULT_FORM.allow_apply_after_placement,
      min_package_difference:
        currentPolicy?.min_package_difference ?? DEFAULT_FORM.min_package_difference,
      ignore_package_condition:
        currentPolicy?.ignore_package_condition ?? DEFAULT_FORM.ignore_package_condition,
      current_placement_season:
        department?.current_placement_season ?? DEFAULT_FORM.current_placement_season,
      change_note: "",
    });
  };

  const fetchPolicyData = async () => {
    setLoading(true);
    try {
      const [policyRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/tpo/policy`, { headers }),
        fetch(`${API_BASE}/tpo/policy/history`, { headers }),
      ]);

      const policyJson = await policyRes.json();
      const historyJson = await historyRes.json();

      if (!policyRes.ok) {
        throw new Error(policyJson.error || "Failed to fetch department policy");
      }

      if (!historyRes.ok) {
        throw new Error(historyJson.error || "Failed to fetch policy history");
      }

      setPolicyData(policyJson);
      setHistory(Array.isArray(historyJson.history) ? historyJson.history : []);
      syncFormFromPolicy(policyJson.current_policy, policyJson.department);
      setError("");
    } catch (err) {
      setError(err.message);
      setPolicyData(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicyData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/tpo/policy`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          ...form,
          min_package_difference: Number(form.min_package_difference || 0),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update policy");
      }

      setSuccess("Department placement policy updated successfully.");
      await fetchPolicyData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const department = policyData?.department;
  const currentPolicy = policyData?.current_policy;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Placement Policy</h1>
        <p className="text-gray-500 mt-1">
          Manage the active placement re-application rule for your department.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}

      <Card className="border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-600" />
            Current Department Policy
          </CardTitle>
          <CardDescription>
            The latest active policy used to decide whether placed students can
            apply again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Loading current policy...</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                  {department
                    ? `${department.dept_code} - ${department.dept_name}`
                    : "Department unavailable"}
                </Badge>
                <Badge className="bg-gray-100 text-gray-700 border border-gray-200">
                  {currentPolicy ? "Policy Active" : "No Policy Set Yet"}
                </Badge>
                <Badge className="bg-green-100 text-green-700 border border-green-200">
                  {department?.current_placement_season
                    ? `Placement Season: ${department.current_placement_season}`
                    : "Placement season not set"}
                </Badge>
              </div>

              {currentPolicy ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">After internship</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {currentPolicy.allow_apply_after_internship
                        ? "Allowed to apply again"
                        : "Blocked after internship"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">After placement</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {currentPolicy.allow_apply_after_placement
                        ? "Allowed, subject to policy"
                        : "Blocked after placement"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Minimum CTC gap</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {formatGap(currentPolicy.min_package_difference)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Package condition</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {currentPolicy.ignore_package_condition
                        ? "Ignored"
                        : "Enforced"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-sm text-gray-500">
                  No department policy has been configured yet. Save one below to
                  start controlling re-application eligibility.
                </div>
              )}

              {currentPolicy && (
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Effective from: {formatDateTime(currentPolicy.effective_from)}</p>
                  <p>Last changed by: {currentPolicy.changed_by || "-"}</p>
                  <p>Change note: {currentPolicy.change_note || "-"}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Update Department Policy
          </CardTitle>
          <CardDescription>
            Changes take effect immediately and are stored in policy history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ChoiceButtons
            label="Students can apply again after internship only"
            helper="This applies when the student only has an internship offer and not a placement/PPO."
            value={form.allow_apply_after_internship}
            trueLabel="Allowed"
            falseLabel="Blocked"
            onChange={(value) =>
              setForm({ ...form, allow_apply_after_internship: value })
            }
          />

          <ChoiceButtons
            label="Students can apply again after placement"
            helper="If blocked, the CTC gap rule below will not be used."
            value={form.allow_apply_after_placement}
            trueLabel="Allowed"
            falseLabel="Blocked"
            onChange={(value) =>
              setForm({ ...form, allow_apply_after_placement: value })
            }
          />

          <ChoiceButtons
            label="Ignore package gap condition"
            helper="If enabled, placed students can re-apply without comparing current and upcoming CTC."
            value={form.ignore_package_condition}
            trueLabel="Yes"
            falseLabel="No"
            onChange={(value) =>
              setForm({ ...form, ignore_package_condition: value })
            }
          />

          <div>
            <label className="text-sm font-medium text-gray-900">
              Current Placement Season
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Set the active placement season for your department. Coordinators
              cannot create companies or drives until this is configured.
            </p>
            <Input
              type="text"
              placeholder="2025-2026"
              value={form.current_placement_season}
              onChange={(e) =>
                setForm({ ...form, current_placement_season: e.target.value })
              }
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900">
              Minimum CTC gap required
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Example: set `3` to require the next drive package to be at least 3
              LPA higher than the student&apos;s accepted placement package.
            </p>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.min_package_difference}
              onChange={(e) =>
                setForm({ ...form, min_package_difference: e.target.value })
              }
              className="mt-2"
              disabled={
                !form.allow_apply_after_placement || form.ignore_package_condition
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900">
              Change note
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Optional note to explain why the department rule changed mid-season.
            </p>
            <textarea
              value={form.change_note}
              onChange={(e) => setForm({ ...form, change_note: e.target.value })}
              rows={3}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="e.g. Updated after department placement committee review"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Policy"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-600" />
            Policy History
          </CardTitle>
          <CardDescription>
            Previous department policies are preserved so mid-season changes remain traceable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500">No policy history available yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry.assignment_id}
                  className="rounded-lg border p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={
                        entry.effective_to
                          ? "bg-gray-100 text-gray-700 border border-gray-200"
                          : "bg-green-100 text-green-700 border border-green-200"
                      }
                    >
                      {entry.effective_to ? "Past Policy" : "Active Policy"}
                    </Badge>
                    <span className="text-sm font-medium text-gray-900">
                      {entry.rule_name || "Unnamed policy"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <p className="text-gray-600">
                      Internship:{" "}
                      <span className="font-medium text-gray-900">
                        {entry.allow_apply_after_internship ? "Allowed" : "Blocked"}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Placement:{" "}
                      <span className="font-medium text-gray-900">
                        {entry.allow_apply_after_placement ? "Allowed" : "Blocked"}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Gap:{" "}
                      <span className="font-medium text-gray-900">
                        {formatGap(entry.min_package_difference)}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Package condition:{" "}
                      <span className="font-medium text-gray-900">
                        {entry.ignore_package_condition ? "Ignored" : "Enforced"}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Effective from:{" "}
                      <span className="font-medium text-gray-900">
                        {formatDateTime(entry.effective_from)}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Effective to:{" "}
                      <span className="font-medium text-gray-900">
                        {formatDateTime(entry.effective_to)}
                      </span>
                    </p>
                  </div>

                  <p className="text-sm text-gray-500">
                    Changed by: {entry.changed_by || "-"} | Note: {entry.change_note || "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}





