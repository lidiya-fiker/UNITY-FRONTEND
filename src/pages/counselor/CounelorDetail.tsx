import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./component/Navbar";
import axios from "axios";
import { API_URL } from "@/config/api";

const CounselorProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const therapist = location.state?.therapist;
  const [profileData, setProfileData] = useState({
    bio: "",
    specialization: "",
  });

  useEffect(() => {
    if (therapist?.id) {
      axios
        .get(`${API_URL}/counselors/profile/${therapist.id}`)
        .then((res) => {
          setProfileData({
            bio: res.data.bio || "",
            specialization: res.data.specialization || "",
          });
        })
        .catch((err) => {
          console.error("Error fetching counselor profile:", err);
        });
    }
  }, [therapist]);

  if (!therapist) {
    return (
      <div className="p-8">
        <p>No therapist data found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-[#4b2a75] text-white px-6 py-2 rounded-md">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0ff]">
      <Navbar />
      <div className="max-w-6xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#4b2a75] mb-8 text-center">
          Counselor Profile
        </h1>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-3 relative">
              {therapist.profilePicture ? (
                <img
                  src={`${API_URL}/uploads/profile-pictures/${therapist.profilePicture}`}
                  alt="Counselor"
                  className="w-full h-auto rounded-lg shadow-sm object-cover aspect-[3/4]"
                />
              ) : (
                <div className="w-full aspect-[3/4] rounded-lg bg-[#4b2a75] flex items-center justify-center">
                  <span className="text-white text-6xl font-bold">
                    {therapist.firstLetter || "?"}
                  </span>
                </div>
              )}
              <button
                onClick={() => navigate(-1)}
                className="mb-6 text-[#4b2a75] underline">
                &larr; Back
              </button>
            </div>

            <div className="md:col-span-4 bg-white rounded-lg shadow-sm p-6">
              <div>
                <h1 className="text-3xl font-bold text-[#4b2a75] mb-2">
                  {therapist.fullName}
                </h1>
                <p className="text-gray-600 mb-4">{therapist.title}</p>
                <h2 className="text-xl font-semibold text-[#4b2a75] mb-3">
                  About Me
                </h2>
                <p className="text-gray-700">{profileData.bio}</p>
              </div>
            </div>

            <div className="md:col-span-5 bg-white rounded-lg shadow-sm p-6">
              <div>
                <h2 className="text-xl font-semibold text-[#4b2a75] mb-3">
                  Qualifications
                </h2>
                <p className="text-gray-700">{profileData.specialization}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorProfile;
