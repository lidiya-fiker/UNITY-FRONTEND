import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IconUser } from "@tabler/icons-react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfToday,
  parse,
  subMonths,
  addMonths,
} from "date-fns";

import { jwtDecode } from "jwt-decode";

interface TimeSlot {
  id?: string;
  start: string;
  end: string;
}

interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

interface Therapist {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
}

interface DecodedToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
}
interface Client {
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  bookings: any[];
  payments: any[];
}

const API_URL = "http://localhost:3000";

const BookSession = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [clientData, setClientData] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    amount: "",
  });

  const public_key = "CHAPUBK_TEST-wT13hhBqi9jnI7GCJunUAQNGHb2HMYC3";

  const params = useParams<{ yearMonth?: string }>();

  const initialMonth = params.yearMonth
    ? parse(params.yearMonth, "yyyy-MM", new Date())
    : new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(initialMonth),
  );
  const today = startOfToday();
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  // useEffect(() => {
  //   setTxRef(uuidv4()); // generate unique tx_ref when component mounts
  // }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3000/counselors")
      .then((res) => {
        setTherapists(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch therapists:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const token = localStorage.getItem("token"); // Adjust if your key is different
        if (!token) throw new Error("No token found");

        const decoded: DecodedToken = jwtDecode(token);
        if (!decoded?.id) throw new Error("Invalid token");

        const response = await axios.get(`${API_URL}/clients/${decoded.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setClientData(response.data);
      } catch (error) {
        console.error("Error fetching client data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, []);



  useEffect(() => {
    const fetchSchedule = async () => {
      if (!selectedTherapist?.id) return;
      const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      try {
        const res = await axios.get(`${API_URL}/schedule/available`, {
          params: {
            startDate,
            endDate,
            counselorId: selectedTherapist.id,
          },
        });

        const scheduleMap: Record<string, TimeSlot[]> = {};
        res.data.forEach((slot: any) => {
          const dateStr = slot.date.split("T")[0];
          if (!scheduleMap[dateStr]) scheduleMap[dateStr] = [];
          scheduleMap[dateStr].push({
            id: slot.id,
            start: slot.startTime,
            end: slot.endTime,
          });
        });

        const newSchedule: DaySchedule[] = Object.entries(scheduleMap).map(
          ([date, slots]) => ({
            date,
            slots,
          }),
        );

        setSchedule(newSchedule);
      } catch (err) {
        console.error("Failed to fetch schedule", err);
      }
    };

    fetchSchedule();
  }, [selectedTherapist, currentMonth]);
  const handleNextStep = async () => {
    if (!selectedSlot || !selectedSlot.id) {
      alert("Please select a valid time slot.");
      return;
    }

    // scheduleId is a string (UUID), no conversion to number
    const scheduleId = selectedSlot.id;

    if (!selectedTherapist?.id) {
      alert("Please select a therapist.");
      return;
    }

    if (!clientData?.user.id) {
      console.log(clientData);
      alert("Client information missing. Please log in again.");
      return;
    }

    // try {
    //   const response = await fetch("http://localhost:3000/api/bookings", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       scheduleId: scheduleId, // send UUID string directly
    //       clientId: "f35a4d7c-979f-493d-b032-aa91a1b984eb",
    //     }),
    //   });

    //   const data = await response.json();

    //   if (!response.ok) {
    //     alert(`Failed to book: ${data.message || JSON.stringify(data)}`);
    //     return;
    //   }

    //   setCurrentStep(currentStep + 1);
    // } catch (err: any) {
    //   alert("Error booking appointment: " + err.message);
    // }
    setCurrentStep(currentStep + 1);
  };
  const handleChangee = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmitt = async (e) => {
    e.preventDefault();

    if (!clientData?.user?.email) {
      alert("Client email not found");
      return;
    }

    if (!selectedSlot?.id) {
      alert("Please select a valid schedule slot");
      return;
    }

    if (!selectedTherapist?.id) {
      alert("Please select a valid counselor");
      return;
    }

    const transactionReference = `tx-${Date.now()}`;
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: clientData.user.email,
      amount: 1000,
      clientId: clientData.user.id,
      counselorId: selectedTherapist?.id,
      scheduleId: selectedSlot.id,
      transactionReference,
    };

    try {
      const res = await fetch("http://localhost:3000/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.chapaRedirectUrl) {
        window.location.href = data.chapaRedirectUrl;
      } else {
        alert(data.message || "Payment initialization failed");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while initializing payment");
    }
  };

  const getDateSchedule = (date: Date): TimeSlot[] => {
    const dateStr = format(date, "yyyy-MM-dd");
    const daySchedule = schedule.find((s) => s.date === dateStr);
    return daySchedule?.slots || [];
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(date, today)) return;
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const steps = [
    { id: 1, title: "Select Your Therapist" },
    { id: 2, title: "Therapist Availability" },
    { id: 3, title: "Summary" },
    { id: 4, title: "Payment" },
    { id: 5, title: "Confirmation" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img
              src="/src/asset/logo.png"
              alt="Unity Logo"
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-[#4b2a75] hover:text-[#3a2057] font-medium">
              Home
            </Link>
            <Link
              to="/counselor-posts"
              className="text-[#4b2a75] hover:text-[#3a2057] font-medium">
              Counselor Posts
            </Link>
            <Link
              to="/logout"
              className="text-[#4b2a75] hover:text-[#3a2057] font-medium">
              Logout
            </Link>
            <Link to="/profile" className="text-[#4b2a75] hover:text-[#3a2057]">
              <IconUser size={24} />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          {/* Steps Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= step.id
                        ? "bg-[#4b2a75] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}>
                    {step.id}
                  </div>
                  <div className="ml-2 text-sm font-medium text-gray-600">
                    {step.title}
                  </div>
                  {step.id !== steps.length && (
                    <div
                      className={`w-24 h-1 mx-2 ${
                        currentStep > step.id ? "bg-[#4b2a75]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-[#4b2a75] mb-6">
                Choose Your Therapist
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {therapists.map((therapist) => {
                  const firstLetter =
                    therapist.firstName?.[0]?.toUpperCase() ||
                    therapist.lastName?.[0]?.toUpperCase() ||
                    "?";

                  return (
                    <div
                      key={therapist.id}
                      onClick={() =>
                        setSelectedTherapist({
                          id: therapist.id,
                          fullName: `${therapist.firstName} ${therapist.lastName}`,
                          image: therapist.image
                            ? `http://localhost:3000/uploads/profile-pictures/${therapist.image}`
                            : null,
                          firstLetter:
                            therapist.firstName?.[0]?.toUpperCase() ||
                            therapist.lastName?.[0]?.toUpperCase() ||
                            "?",
                        })
                      }
                      className={`border rounded-lg p-6 cursor-pointer transition-colors ${
                        selectedTherapist?.id === therapist.id
                          ? "border-[#4b2a75] bg-[#f5f0ff]"
                          : "hover:border-[#4b2a75]"
                      }`}>
                      <div className="flex justify-center mb-4">
                        {therapist.image ? (
                          <img
                            src={`http://localhost:3000/uploads/profile-pictures/${therapist.image}`}
                            alt={`${therapist.firstName} ${therapist.lastName}`}
                            className="w-24 h-24 rounded-full mx-auto object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-[#4b2a75] flex items-center justify-center mx-auto">
                            <span className="text-white text-4xl font-bold">
                              {firstLetter}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-center mb-2">
                        {therapist.firstName} {therapist.lastName}
                      </h3>
                      <button
                        className="mt-4 text-sm text-[#4b2a75] underline hover:text-[#371f5c] px-3 py-1 rounded transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/counselor-profile", {
                            state: {
                              therapist: {
                                id: therapist.id,
                                fullName: `${therapist.firstName} ${therapist.lastName}`,
                                profilePicture: therapist.image,
                                firstLetter:
                                  therapist.firstName?.[0]?.toUpperCase() ||
                                  therapist.lastName?.[0]?.toUpperCase() ||
                                  "?",
                              },
                            },
                          });
                        }}>
                        Read Biography
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() =>
                    selectedTherapist && setCurrentStep(currentStep + 1)
                  }
                  className="bg-[#4b2a75] text-white px-6 py-2 rounded-md hover:bg-[#3a2057] transition-colors"
                  disabled={currentStep === steps.length || !selectedTherapist}>
                  Next
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-[#4b2a75] mb-6">
                Select Available Time Slot
              </h2>

              {/* Therapist Info Card */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Selected Therapist
                </h3>
                {/* Selected Therapist */}
                <div className="flex items-center space-x-4 p-4 bg-[#f5f0ff] rounded-lg">
                  {selectedTherapist?.image ? (
                    <img
                      src={selectedTherapist.image}
                      alt={selectedTherapist.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#4b2a75] flex items-center justify-center text-white text-xl font-bold">
                      {selectedTherapist?.firstLetter || "?"}
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-[#4b2a75]">
                      {selectedTherapist?.fullName}
                    </h4>
                    <p className="text-gray-600">
                      {selectedTherapist?.specialization}
                    </p>
                  </div>
                </div>
              </div>

              {/* Calendar and Booking Panel */}
              <div className="flex gap-8 p-8">
                {/* Calendar Panel */}
                <div className="w-96 rounded-lg bg-white shadow">
                  <div className="flex items-center justify-between border-b px-6 py-2">
                    <span className="text-lg font-semibold">
                      {format(currentMonth, "MMMM yyyy")}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-gray-100 rounded">
                        ←
                      </button>
                      <button
                        onClick={handleNextMonth}
                        className="p-1 hover:bg-gray-100 rounded">
                        →
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-px bg-gray-200 text-center text-xs font-semibold">
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                      (day) => (
                        <div key={day} className="bg-white py-2">
                          {day}
                        </div>
                      ),
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-px bg-gray-200">
                    {days.map((day) => {
                      const dateStr = format(day, "yyyy-MM-dd");
                      const hasSlots = schedule.some((s) => s.date === dateStr);
                      const isPastDate = isBefore(day, today);
                      const isDisabled = isPastDate || !hasSlots;

                      return (
                        <button
                          key={day.toString()}
                          onClick={() => !isDisabled && handleDateClick(day)}
                          disabled={isDisabled}
                          className={`bg-white py-4 text-center relative
                  ${!isSameMonth(day, currentMonth) && "text-gray-400"}
                  ${isToday(day) && "font-bold text-blue-600"}
                  ${
                    selectedDate && isSameDay(day, selectedDate)
                      ? "bg-blue-100"
                      : ""
                  }
                  ${
                    isDisabled
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : "hover:bg-gray-50"
                  }
                `}>
                          {format(day, "d")}
                          {hasSlots && !isDisabled && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Booking Panel */}
                {selectedDate && (
                  <div className="flex-1 rounded-lg bg-white p-6 shadow">
                    <h2 className="text-lg font-semibold mb-6">
                      {format(selectedDate, "EEE MMM dd yyyy")} GMT+0300 (East
                      Africa Time)
                    </h2>

                    <div>
                      <h3 className="font-medium mb-4">Available Time Slots</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {getDateSchedule(selectedDate).map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            className={`flex items-center justify-between px-4 py-2 rounded-md border 
                    ${
                      selectedSlot?.id === slot.id
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 hover:bg-blue-100"
                    }`}>
                            {slot.start} - {slot.end}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors">
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!selectedSlot}
                  className={`bg-[#4b2a75] text-white px-6 py-2 rounded-md transition-colors ${
                    !selectedSlot
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[#3a2057]"
                  }`}>
                  Next
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 &&
            selectedTherapist &&
            selectedDate &&
            selectedSlot && (
              <div>
                <h2 className="text-2xl font-bold text-[#4b2a75] mb-6">
                  Booking Summary
                </h2>
                <div className="bg-[#f5f0ff] rounded-lg p-6 mb-8">
                  <div className="flex items-center space-x-4 mb-6">
                    {selectedTherapist?.image ? (
                      <img
                        src={selectedTherapist.image}
                        alt={selectedTherapist.fullName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#4b2a75] flex items-center justify-center text-white text-xl font-bold">
                        {selectedTherapist?.firstLetter || "?"}
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-[#4b2a75]">
                        {selectedTherapist?.fullName}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-[#e0d5f5]">
                      <span className="text-gray-600">Date</span>
                      <span className="font-medium">
                        {format(selectedDate, "MMMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#e0d5f5]">
                      <span className="text-gray-600">Time</span>
                      <span className="font-medium">
                        {selectedSlot.start} - {selectedSlot.end}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#e0d5f5]">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">1 hour</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#e0d5f5]">
                      <span className="text-gray-600">Session Type</span>
                      <span className="font-medium">Online via Zoom</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Session Fee</span>
                      <span className="font-medium">1000birr</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors">
                    Back
                  </button>

                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="bg-[#4b2a75] text-white px-6 py-2 rounded-md hover:bg-[#3a2057] transition-colors">
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-[#4b2a75] mb-6">
                Payment
              </h2>
              <div className="bg-[#f5f0ff] rounded-lg p-6 mb-8">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={selectedTherapist?.image}
                    alt={selectedTherapist?.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-[#4b2a75]">
                      {selectedTherapist?.name}
                    </h4>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-[#e0d5f5]">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-medium text-[#4b2a75]">
                      1000 birr
                    </span>
                  </div>
                </div>
              </div>

              <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
                <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Client Payment
                  </h2>
                  <form onSubmit={handleSubmitt}>
                    <input
                      name="firstName"
                      type="text"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChangee}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    <br />
                    <input
                      name="lastName"
                      type="text"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChangee}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    <br />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={clientData?.user.email || " "}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    <br />
                    <input
                      name="amount"
                      type="number"
                      placeholder="Amount"
                      value={1000}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      readOnly
                    />
                    <br />
                    <button
                      type="submit"
                      className="bg-[#4b2a75] text-white px-6 py-2 rounded-md hover:bg-[#3a2057] transition-colors">
                      Pay with Chapa
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors">
                  Back
                </button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-[#4b2a75] mb-6">
                Your session is confirmed 🎉🎉
              </h2>
              <div className="bg-[#f5f0ff] rounded-lg p-6 mb-8">
                <p className="text-center text-gray-600 mb-4">
                  You've successfully booked a session with counselor{" "}
                  {selectedTherapist?.name}. We've sent the session details to
                  your email.
                </p>
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => navigate("/counselor-dashboard")}
                  className="bg-[#4b2a75] text-white px-6 py-2 rounded-md hover:bg-[#3a2057] transition-colors">
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookSession;
