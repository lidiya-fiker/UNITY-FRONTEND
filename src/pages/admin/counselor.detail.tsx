import { API_URL } from '@/config/api';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CounselorDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [counselor, setCounselor] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/counselors/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCounselor(data))
      .catch((err) => console.error("Failed to fetch counselor profile:", err));
  }, [userId]);

  if (!counselor) return <div className="text-center mt-10">Loading...</div>;

  const {
    user,
    phoneNumber,
    addres,
    gender,
    specialization,
    cerificate,
    bio,
    languagesSpoken,
    preferredPaymentMethod,
    bankAccountOrPhone,
    profilePicture,
  } = counselor;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => navigate("/adminPanel?tab=counselors")}
        className="mb-6 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded">
        ← Go Back
      </button>

      <h2 className="text-3xl font-bold text-purple-700 mb-8">
        Counselor Profile
      </h2>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-6 border-b pb-6">
          {profilePicture && (
            <img
              src={`${API_URL}/uploads/profile-pictures/${profilePicture}`}
              alt="Profile"
              className="w-24 h-24 object-cover rounded-full border"
            />
          )}
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <p className="text-sm text-purple-500 font-medium">
              {user?.status}
            </p>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Info label="Phone" value={phoneNumber} />
          <Info label="Address" value={addres} />
          <Info label="Gender" value={gender} />
          <Info label="Languages Spoken" value={languagesSpoken?.join(", ")} />
          <Info label="Preferred Payment" value={preferredPaymentMethod} />
          <Info label="Bank / Phone" value={bankAccountOrPhone} />
        </div>

        {/* Bio, Specialization, Certificates */}
        <div className="grid sm:grid-cols-3 gap-6">
          {bio && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-1">Bio</h4>
              <p className="text-gray-700 text-sm">{bio}</p>
            </div>
          )}
          {specialization && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-1">
                Specialization
              </h4>
              <p className="text-gray-700 text-sm">{specialization}</p>
            </div>
          )}
          {cerificate?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">
                Certificates
              </h4>
              <ul className="flex flex-wrap gap-4 text-sm text-purple-700">
                {cerificate.map((file, idx) => (
                  <li key={idx}>
                    <a
                      href={`${API_URL}/uploads/cerificates/${file}`}
                      className="underline"
                      target="_blank"
                      rel="noopener noreferrer">
                      {file}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <h4 className="text-sm text-gray-500 font-medium">{label}</h4>
    <p className="text-gray-800 text-sm font-semibold">{value || '-'}</p>
  </div>
);

export default CounselorDetail;
