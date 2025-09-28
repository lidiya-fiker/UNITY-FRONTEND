import React, { useEffect, useState } from "react";

const PaymentSuccess = () => {
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const txRef = query.get("txRef");

    if (!txRef) {
      setMessage("❌ Transaction reference not found.");
      return;
    }

    fetch(`${API_URL}/payment/verify/${txRef}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setMessage("🎉 Payment verified successfully!");
        } else {
          setMessage("❌ Payment verification failed.");
        }
      })
      .catch(() => {
        setMessage("❌ An error occurred while verifying.");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{message}</h2>
      </div>
    </div>
  );
};

export default PaymentSuccess;
