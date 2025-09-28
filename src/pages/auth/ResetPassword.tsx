import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/config/api";
const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await axios.post(`${API_URL}/user/forget-password`, {
        email,
      });
      const { verificationId } = res.data;
      navigate("/reset-success");
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4effc]">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md text-center">
        <div className="mb-8">
          <img
            src="/src/asset/logo.png"
            alt="Unity Logo"
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[#4b2a75] mb-2">
            Reset Your Password
          </h1>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Your Email Address"
            required
            className="w-full px-4 py-3 rounded-md bg-gray-100 text-gray-700 focus:outline-none"
          />

          <button
            type="submit"
            className="w-full bg-[#4b2a75] hover:bg-[#3a2057] text-white py-3 rounded-lg text-base font-semibold">
            Reset
          </button>
        </form>

        {/* Success & Error Messages */}
        {successMsg && <p className="text-green-600 mt-4">{successMsg}</p>}
        {errorMsg && <p className="text-red-600 mt-4">{errorMsg}</p>}

        <div className="mt-6 space-y-2 text-sm text-gray-700">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#4b2a75] hover:underline font-medium">
              Sign in
            </Link>
          </p>
          <p>
            Don’t have an account?{" "}
            <Link
              to="/register/user"
              className="text-[#4b2a75] hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
