import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/config/api";

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // 6 digits now
  const [verificationCode, setVerificationCode] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [countdown, setCountdown] = useState<number>(120);
  const [isResendDisabled, setIsResendDisabled] = useState<boolean>(true);
  const [verificationId, setVerificationId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("verificationId");
    console.log("Extracted verificationId:", id); // <-- Debug
    if (id) setVerificationId(id);
  }, [location.search]);

  useEffect(() => {
    if (!isResendDisabled) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsResendDisabled(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isResendDisabled]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      if (value && index < 5) {
        const nextInput = document.querySelector(
          `input[name=code-${index + 1}]`,
        ) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.querySelector(
        `input[name=code-${index - 1}]`,
      ) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

const handleVerify = async () => {
  console.log("Current verificationId:", verificationId);
  if (!verificationId) {
    setErrorMessage("Verification ID is missing.");
    return;
  }

  const code = verificationCode.join("");
  if (code.length < 6) {
    setErrorMessage("Please enter the full 6-digit code.");
    return;
  }

  setIsLoading(true);
  setErrorMessage(null);
  setSuccessMessage(null);

  try {
    const res = await fetch(`${API_URL
      }/user/verifyAccount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationId, otp: code, isOtp: true }),
    });

    const data = await res.json();

    if (
      res.ok &&
      (data.success || data.message?.toLowerCase().includes("success"))
    ) {
      setSuccessMessage("Account verified!");
      setErrorMessage(null);

      // Store token in localStorage if available
      if (data.token && data.token.access_token) {
        localStorage.setItem("token", data.token.access_token);
        // Optionally store refresh token if you use it:
        // localStorage.setItem("refresh_token", data.token.refresh_token);
      }

      setTimeout(() => {
        if (data.role?.toLowerCase() === "counselor") {
          navigate("/counselor-dashboard");
        } else {
          navigate("/client-dashboard");
        }
      }, 1000);
    } else {
      setErrorMessage(data.message || "Failed to verify OTP.");
      setSuccessMessage(null);
    }
  } catch {
    setErrorMessage("Failed to verify OTP. Please try again.");
    setSuccessMessage(null);
  } finally {
    setIsLoading(false);
  }
};


  const handleResendCode = async () => {
    if (!verificationId) {
      setErrorMessage("Verification ID is missing.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`${API_URL}/user/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId }),
      });

      const data = await res.json();

      if (res.ok) {
        setVerificationCode(["", "", "", "", "", ""]);
        setIsResendDisabled(true);
        setCountdown(120);
        setErrorMessage(null);
        setSuccessMessage("A new code has been sent to your email.");

        if (data.verificationId) {
          setVerificationId(data.verificationId);
          window.history.replaceState(
            null,
            "",
            `?verificationId=${data.verificationId}`,
          );
        }
      } else {
        setErrorMessage(data.message || "Failed to resend code.");
        setSuccessMessage(null);
      }
    } catch {
      setErrorMessage("Failed to resend code. Please try again.");
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-8">
        <div className="text-center">
          <img
            src="/src/asset/logo.png"
            alt="Unity Logo"
            className="h-16 w-auto mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-[#4b2a75] mb-2">
            Please check your Email
          </h2>
          <p className="text-gray-500 text-sm">
            We've sent a code to your email
          </p>
        </div>

        {errorMessage && (
          <p className="text-red-600 text-center mb-2">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="text-green-600 text-center mb-2">{successMessage}</p>
        )}

        <div className="flex justify-center gap-3">
          {verificationCode.map((code, index) => (
            <input
              key={index}
              type="text"
              name={`code-${index}`}
              value={code}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-2xl font-semibold border-2 rounded-lg focus:border-[#4b2a75] focus:outline-none transition-colors"
              maxLength={1}
              disabled={isLoading}
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          className="w-full bg-[#4b2a75] hover:bg-[#3a2057] text-white py-3 rounded-lg text-base font-semibold"
          disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify"}
        </Button>

        <div className="text-center">
          <button
            onClick={handleResendCode}
            disabled={isResendDisabled || isLoading}
            className={`text-sm ${
              isResendDisabled
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#4b2a75] hover:underline"
            }`}>
            Resend code?{" "}
            {isResendDisabled && (
              <span className="text-gray-400">
                {Math.floor(countdown / 60)}:
                {String(countdown % 60).padStart(2, "0")}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;