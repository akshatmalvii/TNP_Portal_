import React, { useEffect, useState } from "react";
import { Mail, Phone, Briefcase, BookOpen } from "lucide-react";
import { API_BASE_URL } from '../../constants/api';

export default function StudentProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    cgpa: "",
    department: "",
    year: "",
    bio: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/students/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.mobile_number || "",
          cgpa: data.cgpa ? data.cgpa.toString() : "",
          department: data?.Department?.dept_name || "",
          year: data.year || "",
          bio: data.bio || ""
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);


  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not authenticated");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          dept_id: profile.dept_id,
          cgpa: parseFloat(profile.cgpa),
          backlogs: profile.backlogs || 0,
          resume_url: profile.resume_url || "",
          name: profile.name,
          mobile_number: profile.phone,
          email: profile.email,
          bio: profile.bio
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save profile");
      }

      setIsEditing(false);
      alert("Profile saved successfully");
    } catch (error) {
      console.error("Profile save error", error);
      alert(error.message);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-gray-500 mt-1">
          Manage your profile information and preferences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white shadow rounded-lg p-6 space-y-6">

        {/* Top Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Profile Information</h2>
            <p className="text-sm text-gray-500">
              Update your personal and academic information
            </p>
          </div>

          <button
            onClick={() =>
              isEditing ? handleSave() : setIsEditing(true)
            }
            className={`px-4 py-2 rounded border ${
              isEditing
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        {/* Avatar */}
        <div className="flex gap-6 items-start">
          <div className="w-24 h-24 bg-indigo-600 text-white text-3xl font-bold flex items-center justify-center rounded-lg">
            {profile.name.charAt(0)}
          </div>

          <div>
            <h3 className="text-xl font-bold">{profile.name}</h3>
            <p className="text-gray-500 mt-1">
              {profile.department} - {profile.year}
            </p>

            <p className="text-sm text-indigo-600 font-medium mt-2">
              CGPA: {profile.cgpa}/10
            </p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={profile.name}
              disabled={!isEditing}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              className="w-full border rounded-md p-2 mt-1 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled={!isEditing}
              onChange={(e) =>
                handleChange("email", e.target.value)
              }
              className="w-full border rounded-md p-2 mt-1 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              disabled={!isEditing}
              onChange={(e) =>
                handleChange("phone", e.target.value)
              }
              className="w-full border rounded-md p-2 mt-1 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium">CGPA</label>
            <input
              type="number"
              value={profile.cgpa}
              disabled={!isEditing}
              step="0.1"
              min="0"
              max="10"
              onChange={(e) =>
                handleChange("cgpa", e.target.value)
              }
              className="w-full border rounded-md p-2 mt-1 disabled:bg-gray-100"
            />
          </div>

        </div>

        {/* Bio */}
        <div>
          <label className="text-sm font-medium">Bio</label>
          <textarea
            rows="4"
            value={profile.bio}
            disabled={!isEditing}
            onChange={(e) =>
              handleChange("bio", e.target.value)
            }
            className="w-full border rounded-md p-3 mt-1 disabled:bg-gray-100"
          />
        </div>

      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Academic */}
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold">Academic</h3>
          </div>

          <p className="text-sm text-gray-500">Department</p>
          <p className="font-medium mt-1">{profile.department}</p>

          <p className="text-sm text-gray-500 mt-3">Year</p>
          <p className="font-medium">{profile.year}</p>
        </div>

        {/* Contact */}
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold">Contact</h3>
          </div>

          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium mt-1 text-sm break-all">
            {profile.email}
          </p>

          <p className="text-sm text-gray-500 mt-3">Phone</p>
          <p className="font-medium">{profile.phone}</p>
        </div>

        {/* Career */}
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold">Career</h3>
          </div>

          <p className="text-sm text-gray-500">CGPA</p>
          <p className="font-medium mt-1">{profile.cgpa} / 10</p>

          <p className="text-sm text-gray-500 mt-3">
            Placement Status
          </p>
          <p className="font-medium text-green-600">
            Not Yet Placed
          </p>
        </div>

      </div>
    </div>
  );
}





