import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_URL } from "@/config/api";

type MyJwtPayload = { id: string; email: string; [key: string]: unknown};

const ProfileForm = () => {
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Form state
  const [form, setForm] = useState({
    phone: "",
    addres: "",
    gender: "",
    payment: "",
    bank: "",
    cerification: null as File | null,
    about: "",
    specialization: "",
    languages: [] as string[],
    profilePicture: null as File | null,
    existingProfilePicture: "",
    existingCertificateName: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  // Decode token on mount to get userId
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        const id = decoded.id;
        setUserId(id);

        const res = await axios.get(`${API_URL}/counselors/profile/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        setForm((prev) => ({
          ...prev,
          phone: data.phoneNumber || "",
          addres: data.addres || "",
          gender: data.gender || "",
          payment: data.preferredPaymentMethod || "",
          bank: data.bankAccountOrPhone || "",
          about: data.bio || "",
          specialization: data.specialization || "",
          languages: data.languagesSpoken || [],
          existingProfilePicture: data.profilePicture || "",
          existingCertificateName: data.cerificate?.[0] || "",
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
    const { name, value, type, checked, files } = e.target as unknown;

    if (name === "profilePicture" && files?.[0]) {
      setForm((prev) => ({ ...prev, profilePicture: files[0] }));
    } else if (name === "cerification" && files?.[0]) {
      setForm((prev) => ({ ...prev, cerification: files[0] }));
    } else if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        languages: checked
          ? [...prev.languages, value]
          : prev.languages.filter((lang) => lang !== value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) ref.current.click();
  };

  const getBankFieldLabel = () => {
    switch (form.payment) {
      case "Bank Transfer":
        return "Your Bank Account";
      case "Telebirr Payment":
        return "Your Mobile Phone";
      default:
        return "Bank information";
    }
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
    formData.append("specialization", form.specialization);
    formData.append("bio", form.about);
    formData.append("preferredPaymentMethod", form.payment);
    formData.append("bankAccountOrPhone", form.bank);

    form.languages.forEach((lang) => {
      formData.append("languagesSpoken", lang);
    });

    if (form.profilePicture) {
      formData.append("profilePicture", form.profilePicture);
    }

    if (form.cerification) {
      formData.append("cerificate", form.cerification);
    }

    try {
      const res = await fetch(`${API_URL}/counselors/complete-profile`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Failed to submit");
      }

      const result = await res.json();
      console.log("Profile submitted:", result);
      navigate("/counselor-dashboard");
    } catch (error: unknown) {
      console.error("Submission error:", error);
     
    }
  };

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
                <svg>...</svg>
              )}
            </div>
            <button
              type="button"
              onClick={() => triggerFileInput(fileInputRef)}
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
            Edit Your Profile
          </h2>
        </div>

        {/* Form Fields */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-purple-100 border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:outline-none">
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="payment"
              value={form.payment}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-purple-100 border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:outline-none">
              <option value="">Preferred payment method</option>
              <option>Bank Transfer</option>
              <option>Telebirr Payment</option>
            </select>

            <input
              type="text"
              name="bank"
              placeholder={getBankFieldLabel()}
              value={form.bank}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-purple-100 border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:outline-none"
            />

            {/* cerification field with upload icon */}
            <div className="relative">
              <input
                type="text"
                placeholder="certificate"
                value={form.cerification?.name || form.existingCertificateName}
                readOnly
                onClick={() => triggerFileInput(certInputRef)}
                className="w-full px-4 py-3 rounded-md bg-purple-100 border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:outline-none cursor-pointer pr-10"
              />
              <button
                type="button"
                onClick={() => triggerFileInput(certInputRef)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-800"
                aria-label="Upload cerification">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <input
                type="file"
                ref={certInputRef}
                name="cerification"
                onChange={handleChange}
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <textarea
              name="about"
              placeholder="Tell us about yourself..."
              value={form.about}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-purple-100 border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:outline-none resize-none h-48"
            />
            <textarea
              name="specialization"
              placeholder="Your Specializations..."
              value={form.specialization}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-purple-100 border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:outline-none resize-none h-48"
            />

            <div className="bg-purple-100 rounded-md border border-gray-300 p-4 h-48 flex flex-col">
              <span className="block mb-2 font-medium text-gray-700">
                Language spoken
              </span>
              <div className="flex flex-col space-y-2 overflow-auto flex-grow">
                {["English", "Amharic", "Oromic"].map((lang) => (
                  <label
                    key={lang}
                    className="flex items-center space-x-2 cursor-pointer text-gray-700">
                    <input
                      type="checkbox"
                      name="languages"
                      value={lang}
                      checked={form.languages.includes(lang)}
                      onChange={handleChange}
                      className="accent-purple-500"
                    />
                    <span>{lang}</span>
                  </label>
                ))}
              </div>
            </div>
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
              onClick={() => navigate("/counselor-dashboard")}
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
