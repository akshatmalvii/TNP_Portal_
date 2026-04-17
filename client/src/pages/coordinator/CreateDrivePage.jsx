import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateDriveForm from "../../components/tpo/CreateDriveForm";
import { Button } from "../../components/Button";
import { API_BASE_URL } from '../../constants/api';

export default function CreateDrivePage() {
  const navigate = useNavigate();
  const [coordinatorContext, setCoordinatorContext] = useState(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/v1/coordinator/context`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load coordinator context");
        setCoordinatorContext(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingContext(false);
      }
    };

    fetchContext();
  }, []);

  const handleSuccess = () => {
    sessionStorage.setItem(
      "coordinatorDriveSubmitted",
      "Drive sent to the TPO for approval successfully."
    );
    navigate("/dashboard/coordinator/drive-updates");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Job Drive</h1>
          <p className="text-gray-500 mt-1">
            Add a new company drive for your department, then submit it for TPO approval.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md text-sm bg-red-100 text-red-700">
          {error}
        </div>
      )}

      {coordinatorContext && !coordinatorContext.current_placement_season ? (
        <div className="p-8 text-center bg-amber-50 border border-amber-200 rounded-lg">
          <h2 className="text-xl font-semibold text-amber-800">Placement Season Not Set</h2>
          <p className="mt-2 text-amber-700">
            You cannot create job drives until the Training and Placement Officer (TPO) sets the active placement season for your department.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <CreateDriveForm
            apiBase={`${API_BASE_URL}/api/v1/coordinator`}
            fixedDepartmentId={coordinatorContext?.dept_id}
            fixedDepartmentLabel={coordinatorContext?.Department?.dept_name || coordinatorContext?.Department?.dept_code}
            onSuccess={handleSuccess}
            submitLabel="Send For Approval"
            activePlacementSeason={coordinatorContext?.current_placement_season}
          />
        </div>
      )}
    </div>
  );
}





