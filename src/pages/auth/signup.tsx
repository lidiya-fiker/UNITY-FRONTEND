import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, redirect, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/config/api";
// import { IconBrandGoogle } from "@tabler/icons-react";

const ROLE_MAP = {
  client: "CLIENT",
  counselor: "COUNSELOR",
} as const;

const UserRegister = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"client" | "counselor" | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "" as "client" | "counselor" | "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const storedRole = sessionStorage.getItem("selectedRole") as
      | "client"
      | "counselor"
      | null;
    setRole(storedRole);

    if (storedRole) {
      setForm((prev) => ({ ...prev, role: storedRole }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // const handleGoogleSignin = () => {
  //   const role = sessionStorage.getItem("selectedRole");
  //   if (!role) {
  //     setError("Role is required");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setError(null);

  //     const redirectUrl = `${API_URL}/auth/google/start?role=${role}`;
  //     window.location.href = redirectUrl;
  //   } catch (error) {
  //     setError("Google sign-up failed, please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Use and Privacy Policy.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...form,
        role: ROLE_MAP[form.role as "client" | "counselor"] || "",
      };

      const response = await axios.post(`${API_URL}/user/signup`, payload);

      if (response.data?.verificationId) {
        navigate(
          `/verify-email?verificationId=${response.data.verificationId}`,
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Registration failed.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12 rounded-tr-[250px] rounded-bl-[250px]">
        <div className="absolute inset-0">
          <img
            src="/src/asset/pexels-alexander-mass-748453803-31585181.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#4b2a75] bg-opacity-60 backdrop-blur-[3px]"></div>
        </div>
        <div className="relative z-10 text-white text-center">
          <img
            src="/src/asset/logo.png"
            alt="Unity Logo"
            className="h-16 w-auto mx-auto mb-6"
          />
          <h2 className="text-4xl font-bold mb-4">Welcome!!</h2>
          <p className="text-lg mb-8">
            Your Trusted platform for marriage, pre-marriage, and couple
            counseling
          </p>
          <p className=" text-white px-8 py-2">
            Join us for a healthy relationship
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#4b2a75] mb-2">Sign Up</h1>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b2a75] focus:bg-white transition-colors"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b2a75] focus:bg-white transition-colors"
                />
              </div>
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b2a75] focus:bg-white transition-colors"
              />
            </div>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b2a75] focus:bg-white transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={() => setAgreedToTerms(!agreedToTerms)}
                className="rounded border-gray-300 text-[#4b2a75] focus:ring-[#4b2a75]"
              />
              <label htmlFor="terms" className="text-sm text-gray-500">
                By signing up, I agree with the{" "}
                <Link to="/terms" className="text-[#4b2a75] hover:underline">
                  Terms of Use
                </Link>{" "}
                &{" "}
                <Link to="/privacy" className="text-[#4b2a75] hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            <Button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full bg-[#4b2a75] hover:bg-[#3a2057] text-white py-3 rounded-lg text-base font-semibold">
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>

            {error && (
              <p className="text-red-600 text-center mt-2 font-semibold">
                {error}
              </p>
            )}
            {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">
                  Or sign in with
                </span>
              </div>
            </div> */}
            {/* <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoogleSignin}
                disabled={loading}
                className="w-full bg-white-500 text-gray-500 p-2 rounded flex items-center justify-center gap-2">
                {loading ? "Redirecting..." : "Google"}
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.1 0 5.8 1.1 7.9 2.9l5.9-5.9C33.5 2.5 29.1 0 24 0 14.6 0 6.8 5.8 3.4 14.2l7.1 5.5C12.7 13.4 17.9 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.1 24.5c0-1.5-.1-3-.4-4.5H24v9h12.5c-.5 2.6-2.1 4.8-4.4 6.2l6.9 5.4c4-3.7 6.3-9.2 6.3-15.1z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.5 28.1c-1.1-3.2-1.1-6.6 0-9.8l-7.1-5.5C.9 17.4 0 20.6 0 24c0 3.4.9 6.6 2.4 9.3l7.1-5.2z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c5.1 0 9.5-1.7 12.6-4.7l-6.9-5.4c-1.9 1.3-4.3 2-6.9 2-6.1 0-11.3-3.9-13.2-9.3l-7.1 5.2C6.8 42.2 14.6 48 24 48z"
                  />
                </svg>
              </button>
            </div> */}
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#4b2a75] hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
