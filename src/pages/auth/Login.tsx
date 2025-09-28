import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconBrandGoogle } from "@tabler/icons-react";
import { API_URL } from "@/config/api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/user/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Login failed");
        return;
      }

      const data = await response.json();
      console.log("Login response:", data);

      localStorage.setItem("token", data.token.token?.access_token);

      const role = (data.token.role || "").toUpperCase();
      console.log("Extracted role:", role);
      if (role === "COUNSELOR") {
        navigate("/counselor-dashboard");
      } else if (role === "ADMIN") {
        navigate("/adminPanel");
      } else {
        navigate("/client-dashboard");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
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
          <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-lg mb-8">
            Your Trusted platform for marriage, pre-marriage, and couple
            counseling
          </p>
          <p className="border-2 border-white text-white px-8 py-2">
            Sign in to continue your journey
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#4b2a75] mb-2">Sign In</h1>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b2a75] focus:bg-white transition-colors"
              />
            </div>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b2a75] focus:bg-white transition-colors"
              />
              <div className="text-center mt-2">
                <Link
                  to="/reset-password"
                  className="text-sm text-[#4b2a75] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-600 text-sm text-center -mt-4">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#4b2a75] hover:bg-[#3a2057] text-white py-3 rounded-lg text-base font-semibold"
            >
              Sign In
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/select-role"
                className="text-[#4b2a75] hover:underline font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
