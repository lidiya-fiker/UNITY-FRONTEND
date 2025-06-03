import { useNavigate } from "react-router-dom";

const BookingSuccess = () => {
  const navigate = useNavigate(); 

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Rebooking Successful!
      </h1>
      <p className="text-lg text-gray-700">
        Your session has been successfully rescheduled.
      </p>
      <button
        onClick={() => navigate("/client-dashboard")}
        className="mt-6 bg-[#4b2a75] text-white px-4 py-2 rounded">
        Go to Dashboard
      </button>
    </div>
  );
};

export default BookingSuccess;
