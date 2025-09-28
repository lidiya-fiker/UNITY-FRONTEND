import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_URL } from "@/config/api";

type MyJwtPayload = { id: string; email: string; [key: string]: unknown };

const ProfileForm = () => {
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({
    phone: "",
    addres: "",
    gender: "",
    maritalStatus: "",
    profilePicture: null as File | null,
    existingProfilePicture: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Decode token on mount to get userId and fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        const id = decoded.id;
        setUserId(id);

        const res = await axios.get(`${API_URL}/clients/profile/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        setForm((prev) => ({
          ...prev,
          phone: data.phoneNumber || "",
          addres: data.addres || data.addres || "",
          gender:
            data.gender && typeof data.gender === "string"
              ? data.gender.charAt(0).toUpperCase() +
                data.gender.slice(1).toLowerCase()
              : "",
          maritalStatus: data.maritalStatus || "", // do not fallback to unrelated field
          existingProfilePicture: data.profilePicture || "",
        }));
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, files } = e.target as unknown;

    if (name === "profilePicture" && files?.[0]) {
      setForm((prev) => ({ ...prev, profilePicture: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Submit handler: build FormData and send PATCH request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert("User not authenticated.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("phoneNumber", form.phone);
    formData.append("addres", form.addres);
    formData.append("gender", form.gender);
    formData.append("maritalStatus", form.maritalStatus);

    if (form.profilePicture) {
      formData.append("profilePicture", form.profilePicture);
    }

    try {
      const res = await fetch(`${API_URL}/clients/complete-profile`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Failed to submit");
      }

      const result = await res.json();
      console.log("Profile submitted:", result);
      navigate("/client-dashboard");
    } catch (error: unknown) {
      console.error("Submission error:", error);
     
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white bg-opacity-40 rounded-xl shadow-lg p-8">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              {form.profilePicture ? (
                <img
                  src={URL.createObjectURL(form.profilePicture)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : form.existingProfilePicture ? (
                <img
                  src={`${API_URL}/uploads/profile-pictures/${form.existingProfilePicture}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-full h-full text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>
            <button
              type="button"
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 bg-purple-400 rounded-full p-2 border-4 border-white hover:bg-purple-500 transition-colors"
              aria-label="Upload profile picture">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              name="profilePicture"
              onChange={handleChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-purple-800">
            Hello, Edit Your Profile!
          </h2>
        </div>

        {/* Form Fields */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="phone"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-purple-100 border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:outline-none"
            />

            <input
              type="text"
              name="addres"
              placeholder="Enter Your addres"
              value={form.addres}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-purple-100 border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="maritalStatus"
              value={form.maritalStatus}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-purple-100 border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:outline-none">
              <option value="">Marital Status</option>
              <option>Single</option>
              <option>Married</option>
              <option>Divorced</option>
              <option>Widowed</option>
            </select>

            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-purple-100 border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:outline-none">
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-center space-x-6 mt-8">
            <button
              type="submit"
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-12 rounded-lg shadow-md transition-all">
              Submit Profile
            </button>
            <button
              type="button"
              onClick={() => navigate("/client-dashboard")}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-12 rounded-lg shadow-md transition-all">
              Later
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
