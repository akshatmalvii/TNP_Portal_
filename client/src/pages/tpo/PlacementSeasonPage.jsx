import React, { useEffect, useState } from "react";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { API_BASE_URL } from '../constants/api';

const API_BASE = `${API_BASE_URL}/api/v1/tpo`;

export default function PlacementSeasonPage() {
  const { confirm, confirmDialog } = useConfirmDialog();
  const [departmentName, setDepartmentName] = useState("");
  const [currentSeason, setCurrentSeason] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(true);
  const [isEditingSeason, setIsEditingSeason] = useState(false);
  const [seasonStartYear, setSeasonStartYear] = useState("");
  const [seasonSaving, setSeasonSaving] = useState(false);
  const [seasonError, setSeasonError] = useState("");
  const [seasonSuccess, setSeasonSuccess] = useState("");

  useEffect(() => {
    fetchPlacementSeason();
  }, []);

  const fetchPlacementSeason = async () => {
    try {
      setSeasonLoading(true);
      const token = localStorage.getItem("token`);
      const res = await fetch(`${API_BASE}/placement-season`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch placement season");

      setDepartmentName(data.dept_name || "");
      setCurrentSeason(data.current_placement_season || null);
      if (data.current_placement_season) {
        setSeasonStartYear(data.current_placement_season.split("-")[0]);
      }
      setSeasonError("");
    } catch (err) {
      setSeasonError(err.message);
    } finally {
      setSeasonLoading(false);
    }
  };

  const getDefaultStartYear = () => {
    const now = new Date();
    const month = now.getMonth();
    return month >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  };

  const handleSaveSeason = async () => {
    const startYear = parseInt(seasonStartYear, 10);
    if (!startYear || startYear < 2020 || startYear > 2099) {
      setSeasonError("Enter a valid year between 2020 and 2099.");
      return;
    }

    const newSeason = `${startYear}-${startYear + 1}`;

    const shouldProceed = await confirm({
      title: `Set placement season to ${newSeason}?`,
      description: currentSeason
        ? `This will change the active placement season from ${currentSeason} to ${newSeason}. New companies and drives will use the new season, while existing records keep their current values.`
        : `This will set the active placement season to ${newSeason}. Coordinators can start creating companies and drives after this.`,
      confirmText: "Save Season",
    });

    if (!shouldProceed) return;

    setSeasonSaving(true);
    setSeasonError("");
    setSeasonSuccess("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/placement-season`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ placement_season: newSeason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update placement season");

      setCurrentSeason(data.current_placement_season);
      setSeasonStartYear(data.current_placement_season.split("-")[0]);
      setIsEditingSeason(false);
      setSeasonSuccess(`Placement season updated to ${data.current_placement_season}.`);
      setTimeout(() => setSeasonSuccess(""), 4000);
    } catch (err) {
      setSeasonError(err.message);
    } finally {
      setSeasonSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Placement Season</h1>
        <p className="text-gray-500 mt-1">
          Set the active placement year for {departmentName || "your department"}.
        </p>
      </div>

      <Card className={`border-2 ${currentSeason ? "border-indigo-200 bg-gradient-to-r from-indigo-50/60 to-blue-50/60" : "border-amber-300 bg-gradient-to-r from-amber-50/80 to-yellow-50/80"}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${currentSeason ? "bg-indigo-100" : "bg-amber-100"}`}>
                <CalendarClock className={`w-7 h-7 ${currentSeason ? "text-indigo-600" : "text-amber-600"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Placement Season</p>
                {seasonLoading ? (
                  <p className="text-lg text-gray-400 mt-0.5">Loading...</p>
                ) : currentSeason ? (
                  <p className="text-2xl font-bold text-indigo-700 mt-0.5">{currentSeason}</p>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <p className="text-lg font-semibold text-amber-700">Not set yet</p>
                  </div>
                )}
              </div>
            </div>

            {!isEditingSeason ? (
              <Button
                onClick={() => {
                  setIsEditingSeason(true);
                  setSeasonError("");
                  setSeasonSuccess("");
                  if (!seasonStartYear) setSeasonStartYear(String(getDefaultStartYear()));
                }}
                className={currentSeason ? "bg-indigo-600 hover:bg-indigo-700" : "bg-amber-600 hover:bg-amber-700"}
              >
                {currentSeason ? "Change Season" : "Set Placement Season"}
              </Button>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="2020"
                    max="2099"
                    className="w-24 text-center font-semibold"
                    value={seasonStartYear}
                    onChange={(e) => setSeasonStartYear(e.target.value)}
                    placeholder="2025"
                  />
                  <span className="text-gray-500 font-medium">-</span>
                  <span className="text-gray-700 font-semibold w-12">
                    {parseInt(seasonStartYear, 10) ? parseInt(seasonStartYear, 10) + 1 : "----"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveSeason} disabled={seasonSaving} size="sm">
                    {seasonSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingSeason(false);
                      setSeasonError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {seasonError ? (
            <p className="text-sm text-red-600 mt-3 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {seasonError}
            </p>
          ) : null}

          {seasonSuccess ? (
            <p className="text-sm text-green-700 mt-3 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              {seasonSuccess}
            </p>
          ) : null}

          {!currentSeason && !isEditingSeason ? (
            <p className="text-sm text-amber-700/80 mt-3">
              Coordinators cannot add companies or create drives until the placement season is set.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            The selected season is used as the default year for new placement activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p>New companies and drives created after this will be tagged with the active placement season.</p>
          <p>Existing companies, drives, offers, and reports keep their original season values.</p>
          <p>Reports can still be viewed year-wise for past seasons whenever data exists.</p>
        </CardContent>
      </Card>

      {confirmDialog}
    </div>
  );
}





